import {
  PRIVATE_BUCKET,
  PUBLIC_BUCKET,
  createEmptyCMSData,
  defaultProfile,
  defaultSiteSettings,
  normalizeCMSData,
  type Award,
  type BlogPost,
  type CMSCollectionName,
  type CMSData,
  type Certification,
  type ContentEntityType,
  type ContentVersion,
  type Education,
  type Experience,
  type MediaItem,
  type MediaVisibility,
  type Page,
  type ProfileData,
  type Project,
  type Recommendation,
  type SiteSettings,
  type StackItem,
} from "@portfolio/core";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapAwardFromRow,
  mapAwardToRow,
  mapBlogPostFromRow,
  mapBlogPostToRow,
  mapCertificationFromRow,
  mapCertificationToRow,
  mapContentVersionFromRow,
  mapContentVersionToRow,
  mapEducationFromRow,
  mapEducationToRow,
  mapExperienceFromRow,
  mapExperienceToRow,
  mapMediaFromRow,
  mapMediaToRow,
  mapPageFromRow,
  mapPageToRow,
  mapProfileToRow,
  mapProjectFromRow,
  mapProjectToRow,
  mapRecommendationFromRow,
  mapRecommendationToRow,
  mapSingletonFromRow,
  mapSiteSettingsToRow,
  mapStackFromRow,
  mapStackToRow,
} from "./mappers";

type Identifiable = { id: string };
type DatabaseRow = Record<string, any>;

const TABLES = {
  siteSettings: "site_settings",
  profile: "profile",
  projects: "projects",
  blogPosts: "blog_posts",
  pages: "pages",
  experiences: "experiences",
  education: "education",
  certifications: "certifications",
  stack: "stack",
  awards: "awards",
  recommendations: "recommendations",
  media: "media",
  versions: "content_versions",
} as const;

function ensureSuccess<T>(result: { data: T; error: { message: string } | null }, action: string): T {
  if (result.error) {
    throw new Error(`${action}: ${result.error.message}`);
  }
  return result.data;
}

function ensureRows(result: { data: unknown; error: { message: string } | null }, action: string): DatabaseRow[] {
  const rows = ensureSuccess(result, action);
  return Array.isArray(rows) ? (rows as DatabaseRow[]) : [];
}

function isVideo(mimeType: string): boolean {
  return mimeType.startsWith("video/");
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function buildSignedOrPublicUrl(client: SupabaseClient, bucket: string, path: string, visibility: MediaVisibility): Promise<string> {
  if (visibility === "public") {
    const { data } = client.storage.from(bucket).getPublicUrl(path);
    return Promise.resolve(data.publicUrl);
  }

  return client.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60)
    .then(({ data, error }) => {
      if (error) throw new Error(error.message);
      return data.signedUrl;
    });
}

async function loadMedia(client: SupabaseClient): Promise<MediaItem[]> {
  const rows = ensureSuccess(
    await client.from(TABLES.media).select("*").order("created_at", { ascending: false }),
    "Erro ao carregar midia",
  ) as Array<Record<string, any>>;

  return Promise.all(
    rows.map(async (row) => mapMediaFromRow(row as any, await buildSignedOrPublicUrl(client, row.bucket, row.path, row.visibility))),
  );
}

export async function loadPublicCMSData(client: SupabaseClient): Promise<CMSData> {
  const [
    siteSettingsRow,
    profileRow,
    projectsRows,
    blogPostRows,
    pagesRows,
    experiencesRows,
    educationRows,
    certificationsRows,
    stackRows,
    awardsRows,
    recommendationsRows,
  ] = await Promise.all([
    client.from(TABLES.siteSettings).select("*").eq("id", "main").maybeSingle(),
    client.from(TABLES.profile).select("*").eq("id", "main").maybeSingle(),
    client.from(TABLES.projects).select("*").eq("status", "published").order("created_at", { ascending: false }),
    client.from(TABLES.blogPosts).select("*").eq("status", "published").order("created_at", { ascending: false }),
    client.from(TABLES.pages).select("*").eq("status", "published").order("created_at", { ascending: false }),
    client.from(TABLES.experiences).select("*").order("sort_order", { ascending: true }),
    client.from(TABLES.education).select("*").order("sort_order", { ascending: true }),
    client.from(TABLES.certifications).select("*").order("sort_order", { ascending: true }),
    client.from(TABLES.stack).select("*").order("sort_order", { ascending: true }),
    client.from(TABLES.awards).select("*").order("sort_order", { ascending: true }),
    client.from(TABLES.recommendations).select("*").order("sort_order", { ascending: true }),
  ]);

  const empty = createEmptyCMSData();
  const projects = ensureRows(projectsRows, "Erro ao carregar projetos");
  const blogPosts = ensureRows(blogPostRows, "Erro ao carregar artigos");
  const pages = ensureRows(pagesRows, "Erro ao carregar paginas");
  const experiences = ensureRows(experiencesRows, "Erro ao carregar experiencias");
  const education = ensureRows(educationRows, "Erro ao carregar educacao");
  const certifications = ensureRows(certificationsRows, "Erro ao carregar certificacoes");
  const stack = ensureRows(stackRows, "Erro ao carregar stack");
  const awards = ensureRows(awardsRows, "Erro ao carregar premios");
  const recommendations = ensureRows(recommendationsRows, "Erro ao carregar recomendacoes");

  return normalizeCMSData({
    siteSettings: mapSingletonFromRow(siteSettingsRow.data as any, defaultSiteSettings),
    profile: mapSingletonFromRow(profileRow.data as any, defaultProfile),
    projects: projects.map((row) => mapProjectFromRow(row as Parameters<typeof mapProjectFromRow>[0])),
    blogPosts: blogPosts.map((row) => mapBlogPostFromRow(row as Parameters<typeof mapBlogPostFromRow>[0])),
    pages: pages.map((row) => mapPageFromRow(row as Parameters<typeof mapPageFromRow>[0])),
    experiences: experiences.map((row) => mapExperienceFromRow(row as Parameters<typeof mapExperienceFromRow>[0])),
    education: education.map((row) => mapEducationFromRow(row as Parameters<typeof mapEducationFromRow>[0])),
    certifications: certifications.map((row) => mapCertificationFromRow(row as Parameters<typeof mapCertificationFromRow>[0])),
    stack: stack.map((row) => mapStackFromRow(row as Parameters<typeof mapStackFromRow>[0])),
    awards: awards.map((row) => mapAwardFromRow(row as Parameters<typeof mapAwardFromRow>[0])),
    recommendations: recommendations.map((row) => mapRecommendationFromRow(row as Parameters<typeof mapRecommendationFromRow>[0])),
    media: empty.media,
  });
}

export async function loadCmsData(client: SupabaseClient): Promise<CMSData> {
  const [
    siteSettingsRow,
    profileRow,
    projectsRows,
    blogPostRows,
    pagesRows,
    experiencesRows,
    educationRows,
    certificationsRows,
    stackRows,
    awardsRows,
    recommendationsRows,
    mediaRows,
  ] = await Promise.all([
    client.from(TABLES.siteSettings).select("*").eq("id", "main").maybeSingle(),
    client.from(TABLES.profile).select("*").eq("id", "main").maybeSingle(),
    client.from(TABLES.projects).select("*").order("created_at", { ascending: false }),
    client.from(TABLES.blogPosts).select("*").order("created_at", { ascending: false }),
    client.from(TABLES.pages).select("*").order("created_at", { ascending: false }),
    client.from(TABLES.experiences).select("*").order("sort_order", { ascending: true }),
    client.from(TABLES.education).select("*").order("sort_order", { ascending: true }),
    client.from(TABLES.certifications).select("*").order("sort_order", { ascending: true }),
    client.from(TABLES.stack).select("*").order("sort_order", { ascending: true }),
    client.from(TABLES.awards).select("*").order("sort_order", { ascending: true }),
    client.from(TABLES.recommendations).select("*").order("sort_order", { ascending: true }),
    loadMedia(client),
  ]);

  const projects = ensureRows(projectsRows, "Erro ao carregar projetos");
  const blogPosts = ensureRows(blogPostRows, "Erro ao carregar artigos");
  const pages = ensureRows(pagesRows, "Erro ao carregar paginas");
  const experiences = ensureRows(experiencesRows, "Erro ao carregar experiencias");
  const education = ensureRows(educationRows, "Erro ao carregar educacao");
  const certifications = ensureRows(certificationsRows, "Erro ao carregar certificacoes");
  const stack = ensureRows(stackRows, "Erro ao carregar stack");
  const awards = ensureRows(awardsRows, "Erro ao carregar premios");
  const recommendations = ensureRows(recommendationsRows, "Erro ao carregar recomendacoes");

  return normalizeCMSData({
    siteSettings: mapSingletonFromRow(siteSettingsRow.data as any, defaultSiteSettings),
    profile: mapSingletonFromRow(profileRow.data as any, defaultProfile),
    projects: projects.map((row) => mapProjectFromRow(row as Parameters<typeof mapProjectFromRow>[0])),
    blogPosts: blogPosts.map((row) => mapBlogPostFromRow(row as Parameters<typeof mapBlogPostFromRow>[0])),
    pages: pages.map((row) => mapPageFromRow(row as Parameters<typeof mapPageFromRow>[0])),
    experiences: experiences.map((row) => mapExperienceFromRow(row as Parameters<typeof mapExperienceFromRow>[0])),
    education: education.map((row) => mapEducationFromRow(row as Parameters<typeof mapEducationFromRow>[0])),
    certifications: certifications.map((row) => mapCertificationFromRow(row as Parameters<typeof mapCertificationFromRow>[0])),
    stack: stack.map((row) => mapStackFromRow(row as Parameters<typeof mapStackFromRow>[0])),
    awards: awards.map((row) => mapAwardFromRow(row as Parameters<typeof mapAwardFromRow>[0])),
    recommendations: recommendations.map((row) => mapRecommendationFromRow(row as Parameters<typeof mapRecommendationFromRow>[0])),
    media: mediaRows,
  });
}

async function syncCollection<T extends Identifiable, Row>(
  client: SupabaseClient,
  table: string,
  previous: T[],
  next: T[],
  toRow: (item: T) => Row,
): Promise<void> {
  const previousMap = new Map(previous.map((item) => [item.id, item]));
  const nextMap = new Map(next.map((item) => [item.id, item]));
  const toDelete = previous.filter((item) => !nextMap.has(item.id)).map((item) => item.id);
  const toUpsert = next.filter((item) => JSON.stringify(previousMap.get(item.id)) !== JSON.stringify(item));

  if (toUpsert.length > 0) {
    ensureSuccess(await client.from(table).upsert(toUpsert.map(toRow as any)), `Erro ao salvar ${table}`);
  }

  if (toDelete.length > 0) {
    ensureSuccess(await client.from(table).delete().in("id", toDelete), `Erro ao remover de ${table}`);
  }
}

export async function saveSiteSettings(client: SupabaseClient, settings: SiteSettings): Promise<SiteSettings> {
  ensureSuccess(await client.from(TABLES.siteSettings).upsert(mapSiteSettingsToRow(settings)), "Erro ao salvar configuracoes");
  return settings;
}

export async function saveProfile(client: SupabaseClient, profile: ProfileData): Promise<ProfileData> {
  ensureSuccess(await client.from(TABLES.profile).upsert(mapProfileToRow(profile)), "Erro ao salvar perfil");
  return profile;
}

export async function saveProjects(client: SupabaseClient, previous: Project[], next: Project[]): Promise<void> {
  await syncCollection(client, TABLES.projects, previous, next, mapProjectToRow);
}

export async function saveBlogPosts(client: SupabaseClient, previous: BlogPost[], next: BlogPost[]): Promise<void> {
  await syncCollection(client, TABLES.blogPosts, previous, next, mapBlogPostToRow);
}

export async function savePages(client: SupabaseClient, previous: Page[], next: Page[]): Promise<void> {
  await syncCollection(client, TABLES.pages, previous, next, mapPageToRow);
}

export async function saveExperiences(client: SupabaseClient, previous: Experience[], next: Experience[]): Promise<void> {
  await syncCollection(client, TABLES.experiences, previous, next, mapExperienceToRow);
}

export async function saveEducation(client: SupabaseClient, previous: Education[], next: Education[]): Promise<void> {
  await syncCollection(client, TABLES.education, previous, next, mapEducationToRow);
}

export async function saveCertifications(client: SupabaseClient, previous: Certification[], next: Certification[]): Promise<void> {
  await syncCollection(client, TABLES.certifications, previous, next, mapCertificationToRow);
}

export async function saveStack(client: SupabaseClient, previous: StackItem[], next: StackItem[]): Promise<void> {
  await syncCollection(client, TABLES.stack, previous, next, mapStackToRow);
}

export async function saveAwards(client: SupabaseClient, previous: Award[], next: Award[]): Promise<void> {
  await syncCollection(client, TABLES.awards, previous, next, mapAwardToRow);
}

export async function saveRecommendations(client: SupabaseClient, previous: Recommendation[], next: Recommendation[]): Promise<void> {
  await syncCollection(client, TABLES.recommendations, previous, next, mapRecommendationToRow);
}

export async function uploadMedia(
  client: SupabaseClient,
  file: File,
  visibility: MediaVisibility,
): Promise<MediaItem> {
  const bucket = visibility === "public" ? PUBLIC_BUCKET : PRIVATE_BUCKET;
  const safeName = sanitizeFileName(file.name);
  const path = `${new Date().getFullYear()}/${Date.now()}-${safeName}`;
  const kind: MediaItem["kind"] = isVideo(file.type) ? "video" : isImage(file.type) ? "image" : "file";

  ensureSuccess(
    await client.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    }),
    "Erro ao enviar arquivo",
  );

  const item: MediaItem = {
    id: crypto.randomUUID(),
    name: file.name,
    bucket,
    path,
    visibility,
    mimeType: file.type,
    size: file.size,
    kind,
    url: await buildSignedOrPublicUrl(client, bucket, path, visibility),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ensureSuccess(await client.from(TABLES.media).insert(mapMediaToRow(item)), "Erro ao salvar metadados da midia");
  return item;
}

export async function deleteMedia(client: SupabaseClient, item: MediaItem): Promise<void> {
  ensureSuccess(await client.storage.from(item.bucket).remove([item.path]), "Erro ao remover arquivo do storage");
  ensureSuccess(await client.from(TABLES.media).delete().eq("id", item.id), "Erro ao remover midia");
}

export async function saveContentVersion(
  client: SupabaseClient,
  entityType: ContentEntityType,
  entityId: string,
  snapshot: Record<string, unknown>,
  label: string,
): Promise<ContentVersion> {
  const item: ContentVersion = {
    id: crypto.randomUUID(),
    entityType,
    entityId,
    label,
    snapshot,
    createdAt: new Date().toISOString(),
    createdBy: null,
  };

  ensureSuccess(await client.from(TABLES.versions).insert(mapContentVersionToRow(item)), "Erro ao salvar versao");
  return item;
}

export async function loadContentVersions(
  client: SupabaseClient,
  entityType: ContentEntityType,
  entityId: string,
): Promise<ContentVersion[]> {
  const rows = ensureSuccess(
    await client
      .from(TABLES.versions)
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false })
      .limit(30),
    "Erro ao carregar historico",
  ) as Array<Record<string, any>>;

  return rows.map((row) => mapContentVersionFromRow(row as Parameters<typeof mapContentVersionFromRow>[0]));
}

export async function isSlugAvailable(
  client: SupabaseClient,
  collection: Extract<CMSCollectionName, "projects" | "blogPosts" | "pages">,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const table = collection === "projects" ? TABLES.projects : collection === "blogPosts" ? TABLES.blogPosts : TABLES.pages;
  let query = client.from(table).select("id", { head: true, count: "exact" }).eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { count, error } = await query;
  if (error) {
    throw new Error(`Erro ao validar slug: ${error.message}`);
  }

  return (count ?? 0) === 0;
}
