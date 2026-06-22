import { createClient, type Client } from "@libsql/client";
import { createEmptyCMSData, normalizeCMSData, type CMSData } from "@portfolio/core";
import type { CMSProvider } from "./types";

export interface TursoProviderOptions {
  url: string;
  authToken?: string;
}

type CMSContentRow = {
  id: string;
  type: string;
  slug: string;
  title: string | null;
  status: string | null;
  payload: string;
};

function parsePayload<T>(row: CMSContentRow): T {
  return JSON.parse(row.payload) as T;
}

async function loadSnapshot(client: Client): Promise<CMSData | null> {
  const result = await client.execute({
    sql: "select payload from cms_content where type = ? and slug = ? limit 1",
    args: ["snapshot", "public"],
  });
  const payload = result.rows[0]?.payload;
  if (typeof payload !== "string") return null;
  return normalizeCMSData(JSON.parse(payload) as CMSData);
}

async function loadRows(client: Client): Promise<CMSData> {
  const result = await client.execute({
    sql: "select id, type, slug, title, status, payload from cms_content where status = ? or type in (?, ?) order by created_at desc",
    args: ["published", "site_settings", "profile"],
  });
  const rows = result.rows as unknown as CMSContentRow[];
  const data = createEmptyCMSData();

  for (const row of rows) {
    switch (row.type) {
      case "site_settings":
        data.siteSettings = parsePayload(row);
        break;
      case "profile":
        data.profile = parsePayload(row);
        break;
      case "project":
      case "case_study":
        data.projects.push(parsePayload(row));
        break;
      case "article":
      case "blog_post":
        data.blogPosts.push(parsePayload(row));
        break;
      case "page":
        data.pages.push(parsePayload(row));
        break;
      case "experience":
        data.experiences.push(parsePayload(row));
        break;
      case "education":
        data.education.push(parsePayload(row));
        break;
      case "certification":
        data.certifications.push(parsePayload(row));
        break;
      case "stack":
        data.stack.push(parsePayload(row));
        break;
      case "award":
        data.awards.push(parsePayload(row));
        break;
      case "recommendation":
        data.recommendations.push(parsePayload(row));
        break;
    }
  }

  return normalizeCMSData(data);
}

async function ensureSchema(client: Client): Promise<void> {
  await client.execute(`
    create table if not exists cms_content (
      id text primary key,
      type text not null,
      slug text unique not null,
      title text,
      status text default 'published',
      payload text not null,
      created_at text default CURRENT_TIMESTAMP,
      updated_at text default CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    create index if not exists cms_content_type_status_idx
    on cms_content (type, status)
  `);
}

async function saveSnapshot(client: Client, data: CMSData): Promise<void> {
  await ensureSchema(client);
  const snapshot = normalizeCMSData(data);

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
    args: [
      "snapshot:public",
      "snapshot",
      "public",
      "Public CMS snapshot",
      "published",
      JSON.stringify(snapshot),
    ],
  });
}

export function createTursoProvider({ url, authToken }: TursoProviderOptions): CMSProvider {
  const client = createClient({ url, authToken });

  return {
    name: "turso",
    async loadPublicCMSData() {
      return (await loadSnapshot(client)) ?? (await loadRows(client));
    },
    async savePublicCMSData(data) {
      await saveSnapshot(client, data);
    },
  };
}
