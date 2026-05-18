import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectCMSMediaUrls, isSupabaseStorageUrl, rewriteCMSMediaUrls, type MediaManifest } from "../packages/cms-repository/src/index.ts";
import { normalizeCMSData, type CMSData } from "../packages/core/src/index.ts";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const snapshotPath = process.env.CMS_FALLBACK_JSON_PATH?.trim() || path.join(rootDir, "data/fallback/public-cms-snapshot.json");
const coreSnapshotPath = path.join(rootDir, "packages/core/src/recovered/public-cms-snapshot.json");
const manifestPath = process.env.CMS_MEDIA_MANIFEST_PATH?.trim() || path.join(rootDir, "data/fallback/media-manifest.json");
const publicAssetDir = process.env.CMS_MEDIA_PUBLIC_DIR?.trim() || path.join(rootDir, "apps/web/public/cms-assets");
const assetBasePath = process.env.CMS_MEDIA_ASSET_BASE_PATH?.trim() || "/cms-assets";
const includeExternalMedia = process.env.CMS_MIRROR_EXTERNAL_MEDIA === "true";
const downloadTimeoutMs = Number(process.env.CMS_MEDIA_DOWNLOAD_TIMEOUT_MS || 30000);
const localSourceDirs = (process.env.CMS_MEDIA_LOCAL_SOURCE_DIRS || "")
  .split(",")
  .map((dir) => dir.trim())
  .filter(Boolean);

type SnapshotFile = {
  cachedAt?: number;
  data: CMSData;
};

function readSnapshot() {
  const parsed = JSON.parse(fs.readFileSync(snapshotPath, "utf8")) as SnapshotFile | CMSData;
  const data = "data" in parsed && parsed.data ? parsed.data : parsed;
  return normalizeCMSData(data);
}

function readManifest(): MediaManifest {
  if (!fs.existsSync(manifestPath)) {
    return {
      generatedAt: new Date().toISOString(),
      assetBasePath,
      entries: {},
    };
  }

  const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as MediaManifest;
  return {
    generatedAt: parsed.generatedAt || new Date().toISOString(),
    assetBasePath: parsed.assetBasePath || assetBasePath,
    entries: parsed.entries || {},
  };
}

function extensionFromContentType(contentType: string) {
  const clean = contentType.split(";")[0]?.trim().toLowerCase();
  switch (clean) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/svg+xml":
      return ".svg";
    case "video/mp4":
      return ".mp4";
    case "video/webm":
      return ".webm";
    case "application/json":
      return ".json";
    default:
      return "";
  }
}

function extensionFromUrl(url: string) {
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if (/^\.[a-z0-9]{2,8}$/.test(ext)) return ext;
  } catch {
    return "";
  }

  return "";
}

function buildAssetName(url: string, contentType: string) {
  const hash = crypto.createHash("sha256").update(url).digest("hex").slice(0, 24);
  const ext = extensionFromUrl(url) || extensionFromContentType(contentType) || ".bin";
  return `${hash}${ext}`;
}

function normalizeMediaName(value: string) {
  return value
    .toLowerCase()
    .replace(/^\d{8,}-/, "")
    .replace(/[^a-z0-9]+/g, "");
}

function isSkippableDirectory(dirPath: string) {
  const name = path.basename(dirPath);
  return name === "node_modules" || name === ".git" || name === "dist" || name === ".venv";
}

function inferContentType(filePath: string) {
  switch (path.extname(filePath).toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".avif":
      return "image/avif";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
}

async function collectLocalFiles(sourceDirs: string[]) {
  const files: string[] = [];
  const allowedExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".json", ".lottie", ".mp4", ".png", ".svg", ".webm"]);

  async function walk(dirPath: string) {
    let entries: fs.Dirent[];
    try {
      entries = await fsp.readdir(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (!isSkippableDirectory(entryPath)) await walk(entryPath);
        continue;
      }

      if (entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase())) {
        files.push(entryPath);
      }
    }
  }

  for (const sourceDir of sourceDirs) {
    await walk(path.resolve(sourceDir));
  }

  return files;
}

function findLocalMatch(url: string, localFiles: string[]) {
  const targetName = decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
  const normalizedTarget = normalizeMediaName(targetName);

  return (
    localFiles.find((file) => path.basename(file).toLowerCase() === targetName.toLowerCase()) ||
    localFiles.find((file) => normalizeMediaName(path.basename(file)) === normalizedTarget)
  );
}

async function mirrorLocalFile(url: string, sourcePath: string, manifest: MediaManifest) {
  const contentType = inferContentType(sourcePath);
  const bytes = await fsp.readFile(sourcePath);
  const assetName = buildAssetName(url, contentType);
  const assetPath = path.join(publicAssetDir, assetName);

  await fsp.mkdir(publicAssetDir, { recursive: true });
  await fsp.writeFile(assetPath, bytes);

  const entry = {
    originalUrl: url,
    fallbackPath: assetName,
    contentType,
    size: bytes.byteLength,
    mirroredAt: new Date().toISOString(),
  };

  manifest.entries[url] = entry;
  return entry;
}

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), downloadTimeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: "image/*,video/*,application/json,*/*;q=0.8",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function mirrorOne(url: string, manifest: MediaManifest) {
  const existing = manifest.entries[url];
  if (existing) {
    const existingPath = path.join(publicAssetDir, existing.fallbackPath.replace(/^\//, ""));
    if (fs.existsSync(existingPath)) return { status: "cached" as const, entry: existing };
  }

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const bytes = Buffer.from(await response.arrayBuffer());
  const assetName = buildAssetName(url, contentType);
  const assetPath = path.join(publicAssetDir, assetName);

  await fsp.mkdir(publicAssetDir, { recursive: true });
  await fsp.writeFile(assetPath, bytes);

  const entry = {
    originalUrl: url,
    fallbackPath: assetName,
    contentType,
    size: bytes.byteLength,
    mirroredAt: new Date().toISOString(),
  };

  manifest.entries[url] = entry;
  return { status: "downloaded" as const, entry };
}

async function writeJson(filePath: string, value: unknown) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await fsp.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const data = readSnapshot();
  const manifest = readManifest();
  manifest.assetBasePath = assetBasePath;
  manifest.generatedAt = new Date().toISOString();

  const urls = collectCMSMediaUrls(data, { includeExternalMedia }).filter((url) => includeExternalMedia || isSupabaseStorageUrl(url));
  const localFiles = await collectLocalFiles(localSourceDirs);
  let downloaded = 0;
  let cached = 0;
  let local = 0;
  let failed = 0;

  for (const url of urls) {
    try {
      const localMatch = findLocalMatch(url, localFiles);
      if (localMatch) {
        await mirrorLocalFile(url, localMatch, manifest);
        local += 1;
        console.log(`[mirror-public-media] local: ${url} <- ${localMatch}`);
        continue;
      }

      const result = await mirrorOne(url, manifest);
      if (result.status === "downloaded") downloaded += 1;
      if (result.status === "cached") cached += 1;
      console.log(`[mirror-public-media] ${result.status}: ${url}`);
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[mirror-public-media] failed: ${url} - ${message}`);
    }
  }

  await writeJson(manifestPath, manifest);

  if (Object.keys(manifest.entries).length > 0) {
    const rewritten = rewriteCMSMediaUrls(data, manifest);
    const snapshot = { cachedAt: Date.now(), data: rewritten };
    await writeJson(snapshotPath, snapshot);
    await writeJson(coreSnapshotPath, snapshot);
  }

  console.log(
    `[mirror-public-media] concluido: ${downloaded} baixadas, ${local} locais, ${cached} em cache, ${failed} falhas, ${Object.keys(manifest.entries).length} no manifest.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
