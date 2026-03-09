import type {
  Award,
  BlogPost,
  Certification,
  ContentVersion,
  Education,
  Experience,
  MediaItem,
  Page,
  ProfileData,
  Project,
  Recommendation,
  SiteSettings,
  StackItem,
} from "@portfolio/core";

interface SingletonRow<T> {
  id: string;
  data: T;
  created_at: string;
  updated_at: string;
}

interface ContentRow {
  id: string;
  title: string;
  subtitle?: string | null;
  category?: string | null;
  services?: string | null;
  client?: string | null;
  year?: string | null;
  image?: string | null;
  image_bg_color?: string | null;
  image_position?: string | null;
  gallery_images?: string[] | null;
  gallery_positions?: string[] | null;
  link?: string | null;
  slug: string;
  description?: string | null;
  content?: string | null;
  content_blocks?: unknown[] | null;
  password?: string | null;
  status: Project["status"];
  tags?: string[] | null;
  featured?: boolean | null;
  publisher?: string | null;
  date?: string | null;
  author?: string | null;
  read_time?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface SortableRow {
  id: string;
  location?: string | null;
  company?: string | null;
  period?: string | null;
  role?: string | null;
  tasks?: string[] | null;
  degree?: string | null;
  university?: string | null;
  description?: string | null;
  title?: string | null;
  issuer?: string | null;
  link?: string | null;
  name?: string | null;
  quote?: string | null;
  color?: string | null;
  sort_order: number;
}

const STACK_VISUAL_PREFIX = "stack-meta:";

function parseStackVisualField(value?: string | null) {
  const raw = (value || "").trim();
  if (!raw) {
    return { color: "#555555", logo: "" };
  }

  if (!raw.startsWith(STACK_VISUAL_PREFIX)) {
    return { color: raw, logo: "" };
  }

  try {
    const parsed = JSON.parse(raw.slice(STACK_VISUAL_PREFIX.length)) as {
      color?: string;
      logo?: string;
    };

    return {
      color: parsed.color?.trim() || "#555555",
      logo: parsed.logo?.trim() || "",
    };
  } catch {
    return { color: "#555555", logo: "" };
  }
}

function serializeStackVisualField(color: string, logo?: string) {
  const normalizedColor = color.trim() || "#555555";
  const normalizedLogo = logo?.trim() || "";

  if (!normalizedLogo) {
    return normalizedColor;
  }

  return `${STACK_VISUAL_PREFIX}${JSON.stringify({
    color: normalizedColor,
    logo: normalizedLogo,
  })}`;
}

interface MediaRow {
  id: string;
  name: string;
  bucket: string;
  path: string;
  visibility: MediaItem["visibility"];
  mime_type: string;
  size: number;
  kind: MediaItem["kind"];
  created_at: string;
  updated_at: string;
}

interface ContentVersionRow {
  id: string;
  entity_type: ContentVersion["entityType"];
  entity_id: string;
  label: string;
  snapshot: Record<string, unknown>;
  created_at: string;
  created_by?: string | null;
}

export function mapSingletonFromRow<T extends { createdAt: string; updatedAt: string }>(
  row: SingletonRow<Omit<T, "createdAt" | "updatedAt">> | null,
  fallback: T,
): T {
  if (!row?.data) return fallback;
  return {
    ...fallback,
    ...row.data,
    createdAt: row.created_at ?? fallback.createdAt,
    updatedAt: row.updated_at ?? fallback.updatedAt,
  };
}

export function mapSiteSettingsToRow(settings: SiteSettings): SingletonRow<Omit<SiteSettings, "createdAt" | "updatedAt">> {
  const { createdAt: _createdAt, updatedAt: _updatedAt, ...data } = settings;
  return {
    id: settings.id,
    data,
    created_at: settings.createdAt,
    updated_at: settings.updatedAt,
  };
}

export function mapProfileToRow(profile: ProfileData): SingletonRow<Omit<ProfileData, "createdAt" | "updatedAt">> {
  const { createdAt: _createdAt, updatedAt: _updatedAt, ...data } = profile;
  return {
    id: profile.id,
    data,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  };
}

export function mapProjectFromRow(row: ContentRow): Project {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? "",
    category: row.category ?? "",
    services: row.services ?? "",
    client: row.client ?? "",
    year: row.year ?? "",
    image: row.image ?? "",
    imageBgColor: row.image_bg_color ?? "",
    imagePosition: row.image_position ?? "50% 50%",
    galleryImages: row.gallery_images ?? [],
    galleryPositions: row.gallery_positions ?? [],
    link: row.link ?? "#",
    slug: row.slug,
    description: row.description ?? "",
    contentBlocks: (row.content_blocks as Project["contentBlocks"]) ?? [],
    password: row.password ?? "",
    status: row.status,
    tags: row.tags ?? [],
    featured: Boolean(row.featured),
    seoTitle: row.seo_title ?? "",
    seoDescription: row.seo_description ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? null,
  };
}

export function mapProjectToRow(project: Project): ContentRow {
  return {
    id: project.id,
    title: project.title,
    subtitle: project.subtitle,
    category: project.category,
    services: project.services,
    client: project.client,
    year: project.year,
    image: project.image,
    image_bg_color: project.imageBgColor ?? "",
    image_position: project.imagePosition ?? "50% 50%",
    gallery_images: project.galleryImages,
    gallery_positions: project.galleryPositions ?? [],
    link: project.link,
    slug: project.slug,
    description: project.description,
    content_blocks: project.contentBlocks,
    password: project.password ?? "",
    status: project.status,
    tags: project.tags,
    featured: project.featured,
    seo_title: project.seoTitle,
    seo_description: project.seoDescription,
    published_at: project.publishedAt ?? null,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}

export function mapBlogPostFromRow(row: ContentRow): BlogPost {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? "",
    publisher: row.publisher ?? "",
    date: row.date ?? "",
    description: row.description ?? "",
    image: row.image ?? "",
    imageBgColor: row.image_bg_color ?? "",
    imagePosition: row.image_position ?? "50% 50%",
    galleryPositions: row.gallery_positions ?? [],
    galleryImages: row.gallery_images ?? [],
    content: row.content ?? "",
    contentBlocks: (row.content_blocks as BlogPost["contentBlocks"]) ?? [],
    slug: row.slug,
    status: row.status,
    tags: row.tags ?? [],
    featured: Boolean(row.featured),
    author: row.author ?? "",
    readTime: row.read_time ?? "5 min",
    link: row.link ?? "",
    category: row.category ?? "",
    services: row.services ?? "",
    password: row.password ?? "",
    seoTitle: row.seo_title ?? "",
    seoDescription: row.seo_description ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? null,
  };
}

export function mapBlogPostToRow(post: BlogPost): ContentRow {
  return {
    id: post.id,
    title: post.title,
    subtitle: post.subtitle ?? "",
    publisher: post.publisher,
    date: post.date,
    description: post.description,
    image: post.image,
    image_bg_color: post.imageBgColor ?? "",
    image_position: post.imagePosition ?? "50% 50%",
    gallery_images: post.galleryImages ?? [],
    gallery_positions: post.galleryPositions ?? [],
    content: post.content,
    content_blocks: post.contentBlocks,
    slug: post.slug,
    status: post.status,
    tags: post.tags,
    featured: post.featured,
    author: post.author,
    read_time: post.readTime,
    link: post.link ?? "",
    category: post.category ?? "",
    services: post.services ?? "",
    password: post.password ?? "",
    seo_title: post.seoTitle,
    seo_description: post.seoDescription,
    published_at: post.publishedAt ?? null,
    created_at: post.createdAt,
    updated_at: post.updatedAt,
  };
}

export function mapPageFromRow(row: ContentRow): Page {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? "",
    contentBlocks: (row.content_blocks as Page["contentBlocks"]) ?? [],
    status: row.status,
    seoTitle: row.seo_title ?? "",
    seoDescription: row.seo_description ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? null,
  };
}

export function mapPageToRow(page: Page): ContentRow {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    description: page.description,
    content_blocks: page.contentBlocks,
    status: page.status,
    seo_title: page.seoTitle,
    seo_description: page.seoDescription,
    published_at: page.publishedAt ?? null,
    created_at: page.createdAt,
    updated_at: page.updatedAt,
  };
}

export function mapExperienceFromRow(row: SortableRow): Experience {
  return {
    id: row.id,
    location: row.location ?? "",
    company: row.company ?? "",
    period: row.period ?? "",
    role: row.role ?? "",
    tasks: row.tasks ?? [],
    sortOrder: row.sort_order,
  };
}

export function mapExperienceToRow(item: Experience): SortableRow {
  return {
    id: item.id,
    location: item.location,
    company: item.company,
    period: item.period,
    role: item.role,
    tasks: item.tasks,
    sort_order: item.sortOrder,
  };
}

export function mapEducationFromRow(row: SortableRow): Education {
  return {
    id: row.id,
    location: row.location ?? "",
    period: row.period ?? "",
    degree: row.degree ?? "",
    university: row.university ?? "",
    description: row.description ?? "",
    sortOrder: row.sort_order,
  };
}

export function mapEducationToRow(item: Education): SortableRow {
  return {
    id: item.id,
    location: item.location,
    period: item.period,
    degree: item.degree,
    university: item.university,
    description: item.description,
    sort_order: item.sortOrder,
  };
}

export function mapCertificationFromRow(row: SortableRow): Certification {
  return {
    id: row.id,
    title: row.title ?? "",
    issuer: row.issuer ?? "",
    link: row.link ?? "",
    sortOrder: row.sort_order,
  };
}

export function mapCertificationToRow(item: Certification): SortableRow {
  return {
    id: item.id,
    title: item.title,
    issuer: item.issuer,
    link: item.link,
    sort_order: item.sortOrder,
  };
}

export function mapStackFromRow(row: SortableRow): StackItem {
  const visual = parseStackVisualField(row.color);
  return {
    id: row.id,
    name: row.name ?? "",
    description: row.description ?? "",
    color: visual.color,
    logo: visual.logo,
    link: row.link ?? "",
    sortOrder: row.sort_order,
  };
}

export function mapStackToRow(item: StackItem): SortableRow {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    color: serializeStackVisualField(item.color, item.logo),
    link: item.link,
    sort_order: item.sortOrder,
  };
}

export function mapAwardFromRow(row: SortableRow): Award {
  return {
    id: row.id,
    title: row.title ?? "",
    issuer: row.issuer ?? "",
    link: row.link ?? "",
    sortOrder: row.sort_order,
  };
}

export function mapAwardToRow(item: Award): SortableRow {
  return {
    id: item.id,
    title: item.title,
    issuer: item.issuer,
    link: item.link,
    sort_order: item.sortOrder,
  };
}

export function mapRecommendationFromRow(row: SortableRow): Recommendation {
  return {
    id: row.id,
    name: row.name ?? "",
    role: row.role ?? "",
    quote: row.quote ?? "",
    sortOrder: row.sort_order,
  };
}

export function mapRecommendationToRow(item: Recommendation): SortableRow {
  return {
    id: item.id,
    name: item.name,
    role: item.role,
    quote: item.quote,
    sort_order: item.sortOrder,
  };
}

export function mapMediaFromRow(row: MediaRow, url: string): MediaItem {
  return {
    id: row.id,
    name: row.name,
    bucket: row.bucket,
    path: row.path,
    visibility: row.visibility,
    mimeType: row.mime_type,
    size: row.size,
    kind: row.kind,
    url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapMediaToRow(item: MediaItem): MediaRow {
  return {
    id: item.id,
    name: item.name,
    bucket: item.bucket,
    path: item.path,
    visibility: item.visibility,
    mime_type: item.mimeType,
    size: item.size,
    kind: item.kind,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

export function mapContentVersionFromRow(row: ContentVersionRow): ContentVersion {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    label: row.label,
    snapshot: row.snapshot,
    createdAt: row.created_at,
    createdBy: row.created_by ?? null,
  };
}

export function mapContentVersionToRow(item: ContentVersion): ContentVersionRow {
  return {
    id: item.id,
    entity_type: item.entityType,
    entity_id: item.entityId,
    label: item.label,
    snapshot: item.snapshot,
    created_at: item.createdAt,
    created_by: item.createdBy ?? null,
  };
}
