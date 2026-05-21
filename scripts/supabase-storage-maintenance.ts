import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAdminSupabaseClient, loadCmsData } from "../packages/supabase/src/index.ts";
import { PRIVATE_BUCKET, PUBLIC_BUCKET, type CMSData, type MediaItem } from "../packages/core/src/index.ts";
import { collectCMSMediaUrls, isSupabaseStorageUrl } from "../packages/cms-repository/src/index.ts";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath =
  process.env.SUPABASE_STORAGE_MAINTENANCE_OUTPUT?.trim() ||
  path.join(rootDir, "data/fallback/supabase-storage-maintenance-report.json");
const minAgeDays = Number(process.env.SUPABASE_CLEANUP_MIN_AGE_DAYS || 7);
const applyCleanup = process.argv.includes("--apply") || process.env.SUPABASE_CLEANUP_APPLY === "true";
const buckets = (process.env.SUPABASE_CLEANUP_BUCKETS || `${PUBLIC_BUCKET},${PRIVATE_BUCKET}`)
  .split(",")
  .map((bucket) => bucket.trim())
  .filter(Boolean);

type StorageObject = {
  bucket: string;
  path: string;
  name: string;
  size: number;
  createdAt: string | null;
  updatedAt: string | null;
  mimeType: string | null;
};

type SupabaseMediaRef = {
  bucket: string;
  path: string;
  url: string;
};

function getEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function parseStorageUrl(value: string): SupabaseMediaRef | null {
  if (!isSupabaseStorageUrl(value)) return null;

  const url = new URL(value);
  const parts = url.pathname.split("/").filter(Boolean);
  const objectIndex = parts.indexOf("object");
  if (objectIndex < 0) return null;

  const bucket = parts[objectIndex + 2];
  const objectPath = parts.slice(objectIndex + 3).map(decodeURIComponent).join("/");
  if (!bucket || !objectPath) return null;

  return { bucket, path: objectPath, url: value };
}

function objectKey(bucket: string, objectPath: string) {
  return `${bucket}/${objectPath}`;
}

function collectReferencedStorageObjects(data: CMSData) {
  const contentOnlyData = { ...data, media: [] };
  const urls = collectCMSMediaUrls(contentOnlyData, { includeExternalMedia: false });
  const refs = urls.flatMap((url) => {
    const parsed = parseStorageUrl(url);
    return parsed ? [parsed] : [];
  });

  return {
    refs,
    keys: new Set(refs.map((ref) => objectKey(ref.bucket, ref.path))),
  };
}

function mediaRowsForStorage(data: CMSData) {
  return data.media.filter((item) => item.bucket && item.path);
}

function isRecentObject(object: StorageObject) {
  const timestamp = object.updatedAt || object.createdAt;
  if (!timestamp || !Number.isFinite(minAgeDays) || minAgeDays <= 0) return false;
  const ageMs = Date.now() - new Date(timestamp).getTime();
  return ageMs < minAgeDays * 24 * 60 * 60 * 1000;
}

async function listStorageObjects(
  client: ReturnType<typeof createAdminSupabaseClient>,
  bucket: string,
  prefix = "",
): Promise<StorageObject[]> {
  const objects: StorageObject[] = [];
  const limit = 1000;

  for (let offset = 0; ; offset += limit) {
    const { data, error } = await client.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) throw new Error(`Erro ao listar bucket ${bucket}: ${error.message}`);
    if (!data?.length) break;

    for (const item of data) {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
      const metadata = item.metadata as Record<string, unknown> | null;
      const isFolder = !item.id && !metadata?.size;

      if (isFolder) {
        objects.push(...(await listStorageObjects(client, bucket, itemPath)));
        continue;
      }

      objects.push({
        bucket,
        path: itemPath,
        name: item.name,
        size: Number(metadata?.size || 0),
        createdAt: item.created_at ?? null,
        updatedAt: item.updated_at ?? null,
        mimeType: typeof metadata?.mimetype === "string" ? metadata.mimetype : null,
      });
    }

    if (data.length < limit) break;
  }

  return objects;
}

async function deleteStorageObjects(client: ReturnType<typeof createAdminSupabaseClient>, objects: StorageObject[]) {
  const grouped = new Map<string, string[]>();
  for (const object of objects) {
    grouped.set(object.bucket, [...(grouped.get(object.bucket) || []), object.path]);
  }

  for (const [bucket, paths] of grouped) {
    for (let index = 0; index < paths.length; index += 100) {
      const batch = paths.slice(index, index + 100);
      const { error } = await client.storage.from(bucket).remove(batch);
      if (error) throw new Error(`Erro ao remover objetos de ${bucket}: ${error.message}`);
    }
  }
}

async function deleteMediaRows(client: ReturnType<typeof createAdminSupabaseClient>, rows: MediaItem[]) {
  const ids = rows.map((row) => row.id).filter(Boolean);
  for (let index = 0; index < ids.length; index += 100) {
    const batch = ids.slice(index, index + 100);
    const { error } = await client.from("media").delete().in("id", batch);
    if (error) throw new Error(`Erro ao remover metadados da tabela media: ${error.message}`);
  }
}

function summarizeBytes(objects: Pick<StorageObject, "size">[]) {
  return objects.reduce((total, object) => total + (object.size || 0), 0);
}

async function writeReport(report: unknown) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
}

async function main() {
  const client = createAdminSupabaseClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"));
  const data = await loadCmsData(client);
  const referenced = collectReferencedStorageObjects(data);
  const mediaRows = mediaRowsForStorage(data);
  const mediaRowKeys = new Set(mediaRows.map((item) => objectKey(item.bucket, item.path)));
  const storageObjects = (await Promise.all(buckets.map((bucket) => listStorageObjects(client, bucket)))).flat();
  const unusedObjects = storageObjects.filter((object) => !referenced.keys.has(objectKey(object.bucket, object.path)));
  const cleanupCandidates = unusedObjects.filter((object) => !isRecentObject(object));
  const recentUnusedObjects = unusedObjects.filter((object) => isRecentObject(object));
  const orphanMediaRows = mediaRows.filter((item) => !referenced.keys.has(objectKey(item.bucket, item.path)));
  const storageObjectsWithoutMediaRow = storageObjects.filter((object) => !mediaRowKeys.has(objectKey(object.bucket, object.path)));
  const report = {
    generatedAt: new Date().toISOString(),
    mode: applyCleanup ? "apply" : "dry-run",
    minAgeDays,
    buckets,
    totals: {
      referencedObjects: referenced.keys.size,
      mediaRows: mediaRows.length,
      storageObjects: storageObjects.length,
      storageBytes: summarizeBytes(storageObjects),
      unusedObjects: unusedObjects.length,
      unusedBytes: summarizeBytes(unusedObjects),
      cleanupCandidates: cleanupCandidates.length,
      cleanupCandidateBytes: summarizeBytes(cleanupCandidates),
      recentUnusedObjects: recentUnusedObjects.length,
      orphanMediaRows: orphanMediaRows.length,
      storageObjectsWithoutMediaRow: storageObjectsWithoutMediaRow.length,
    },
    cleanupCandidates,
    recentUnusedObjects,
    orphanMediaRows: orphanMediaRows.map((item) => ({
      id: item.id,
      name: item.name,
      bucket: item.bucket,
      path: item.path,
      size: item.size,
      createdAt: item.createdAt,
    })),
    storageObjectsWithoutMediaRow,
  };

  if (applyCleanup) {
    await deleteStorageObjects(client, cleanupCandidates);
    await deleteMediaRows(client, orphanMediaRows);
  }

  await writeReport(report);

  console.log(
    `[supabase-storage-maintenance] ${applyCleanup ? "limpeza aplicada" : "dry-run"}: ` +
      `${cleanupCandidates.length} objetos (${(summarizeBytes(cleanupCandidates) / 1024 / 1024).toFixed(1)} MB) ` +
      `e ${orphanMediaRows.length} linhas media candidatas. Relatorio: ${outputPath}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
