import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type Client } from "@libsql/client";
import { normalizeCMSData, type CMSData, type ContentStatus } from "../packages/core/src/index.ts";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

type SnapshotFile = {
  cachedAt?: number;
  data: CMSData;
};

type ContentInput = {
  id: string;
  type: string;
  slug: string;
  title?: string;
  status?: ContentStatus | "published";
  payload: unknown;
};

function getEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

function readSnapshot() {
  const snapshotPath = process.env.CMS_FALLBACK_JSON_PATH?.trim() || path.join(rootDir, "data/fallback/public-cms-snapshot.json");
  const parsed = JSON.parse(fs.readFileSync(snapshotPath, "utf8")) as SnapshotFile;
  return normalizeCMSData(parsed.data);
}

async function applySchema(client: Client) {
  const schema = fs.readFileSync(path.join(rootDir, "scripts/turso-schema.sql"), "utf8");
  const statements = schema
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await client.execute(statement);
  }
}

function buildRows(data: CMSData): ContentInput[] {
  return [
    {
      id: "snapshot:public",
      type: "snapshot",
      slug: "public",
      title: "Public CMS snapshot",
      status: "published",
      payload: data,
    },
    {
      id: "site_settings:main",
      type: "site_settings",
      slug: "site-settings",
      title: data.siteSettings.siteTitle || "Site settings",
      status: "published",
      payload: data.siteSettings,
    },
    {
      id: "profile:main",
      type: "profile",
      slug: "profile",
      title: data.profile.name || "Profile",
      status: "published",
      payload: data.profile,
    },
    ...data.projects.map((item) => ({
      id: `project:${item.id}`,
      type: "project",
      slug: item.slug,
      title: item.title,
      status: item.status,
      payload: item,
    })),
    ...data.blogPosts.map((item) => ({
      id: `article:${item.id}`,
      type: "article",
      slug: item.slug,
      title: item.title,
      status: item.status,
      payload: item,
    })),
    ...data.pages.map((item) => ({
      id: `page:${item.id}`,
      type: "page",
      slug: item.slug,
      title: item.title,
      status: item.status,
      payload: item,
    })),
  ];
}

async function upsertRow(client: Client, row: ContentInput) {
  await client.execute({
    sql: `
      insert into cms_content (id, type, slug, title, status, payload, updated_at)
      values (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      on conflict(id) do update set
        type = excluded.type,
        slug = excluded.slug,
        title = excluded.title,
        status = excluded.status,
        payload = excluded.payload,
        updated_at = CURRENT_TIMESTAMP
    `,
    args: [row.id, row.type, row.slug, row.title || null, row.status || "published", JSON.stringify(row.payload)],
  });
}

async function main() {
  const client = createClient({
    url: getEnv("TURSO_DATABASE_URL"),
    authToken: getEnv("TURSO_AUTH_TOKEN"),
  });
  const data = readSnapshot();
  const rows = buildRows(data);

  await applySchema(client);
  for (const row of rows) {
    await upsertRow(client, row);
  }

  console.log(`Turso import concluido: ${rows.length} registros em cms_content.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
