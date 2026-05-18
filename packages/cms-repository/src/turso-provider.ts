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

export function createTursoProvider({ url, authToken }: TursoProviderOptions): CMSProvider {
  const client = createClient({ url, authToken });

  return {
    name: "turso",
    async loadPublicCMSData() {
      return (await loadSnapshot(client)) ?? (await loadRows(client));
    },
  };
}
