import { normalizeCMSData, type CMSData, type ContentBlock } from "@portfolio/core";

export interface MediaManifestEntry {
  originalUrl: string;
  fallbackPath: string;
  contentType?: string;
  size?: number;
  mirroredAt?: string;
}

export interface MediaManifest {
  generatedAt: string;
  assetBasePath: string;
  entries: Record<string, MediaManifestEntry>;
}

const SUPABASE_STORAGE_PATH = "/storage/v1/object/";

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isSupabaseStorageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.hostname.endsWith(".supabase.co") && url.pathname.includes(SUPABASE_STORAGE_PATH);
  } catch {
    return false;
  }
}

function addUrl(urls: Set<string>, value: unknown, includeExternalMedia: boolean) {
  if (typeof value !== "string") return;
  const trimmed = value.trim();
  if (!trimmed || !isHttpUrl(trimmed)) return;
  if (!includeExternalMedia && !isSupabaseStorageUrl(trimmed)) return;
  urls.add(trimmed);
}

function addUrlList(urls: Set<string>, values: unknown, includeExternalMedia: boolean) {
  if (!Array.isArray(values)) return;
  values.forEach((value) => addUrl(urls, value, includeExternalMedia));
}

function collectBlockMediaUrls(urls: Set<string>, block: ContentBlock, includeExternalMedia: boolean) {
  if (block.type === "image") {
    addUrl(urls, block.url, includeExternalMedia);
    addUrlList(urls, block.galleryImages, includeExternalMedia);
    return;
  }

  if (block.type === "video") {
    addUrl(urls, block.url, includeExternalMedia);
    addUrl(urls, block.poster, includeExternalMedia);
    return;
  }

  if (block.type === "cards") {
    block.cards.forEach((card) => addUrl(urls, card.image, includeExternalMedia));
    return;
  }

  if (block.type === "icon-grid") {
    block.icons.forEach((icon) => addUrl(urls, icon.url, includeExternalMedia));
  }
}

export function collectCMSMediaUrls(data: CMSData, options: { includeExternalMedia?: boolean } = {}) {
  const includeExternalMedia = options.includeExternalMedia ?? false;
  const normalized = normalizeCMSData(data);
  const urls = new Set<string>();

  addUrl(urls, normalized.profile.photo, includeExternalMedia);
  normalized.siteSettings.homeGalleryItems.forEach((item) => addUrl(urls, item.image, includeExternalMedia));
  Object.values(normalized.siteSettings.projectCardOverrides).forEach((override) =>
    addUrl(urls, override.image, includeExternalMedia),
  );
  Object.values(normalized.siteSettings.blogPostCardOverrides).forEach((override) =>
    addUrl(urls, override.image, includeExternalMedia),
  );

  normalized.stack.forEach((item) => addUrl(urls, item.logo, includeExternalMedia));
  normalized.media.forEach((item) => addUrl(urls, item.url, includeExternalMedia));

  normalized.projects.forEach((project) => {
    addUrl(urls, project.image, includeExternalMedia);
    addUrl(urls, project.cardImage, includeExternalMedia);
    addUrlList(urls, project.galleryImages, includeExternalMedia);
    project.contentBlocks.forEach((block) => collectBlockMediaUrls(urls, block, includeExternalMedia));
  });

  normalized.blogPosts.forEach((post) => {
    addUrl(urls, post.image, includeExternalMedia);
    addUrl(urls, post.cardImage, includeExternalMedia);
    addUrlList(urls, post.galleryImages, includeExternalMedia);
    post.contentBlocks.forEach((block) => collectBlockMediaUrls(urls, block, includeExternalMedia));
  });

  normalized.pages.forEach((page) => {
    page.contentBlocks.forEach((block) => collectBlockMediaUrls(urls, block, includeExternalMedia));
  });

  return Array.from(urls).sort();
}

function joinAssetUrl(base: string, fallbackPath: string) {
  if (/^https?:\/\//.test(fallbackPath) || fallbackPath.startsWith("/")) return fallbackPath;
  const cleanBase = base.replace(/\/$/, "");
  const cleanPath = fallbackPath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
}

function rewriteKnownUrl(value: string, manifest: MediaManifest, assetBaseUrl?: string) {
  const entry = manifest.entries[value];
  if (!entry) return value;
  const base = assetBaseUrl ?? manifest.assetBasePath ?? "";
  return joinAssetUrl(base, entry.fallbackPath);
}

function rewriteBlockMedia(block: ContentBlock, manifest: MediaManifest, assetBaseUrl?: string): ContentBlock {
  if (block.type === "image") {
    return {
      ...block,
      url: rewriteKnownUrl(block.url, manifest, assetBaseUrl),
      galleryImages: block.galleryImages?.map((url) => rewriteKnownUrl(url, manifest, assetBaseUrl)),
    };
  }

  if (block.type === "video") {
    return {
      ...block,
      url: rewriteKnownUrl(block.url, manifest, assetBaseUrl),
      poster: block.poster ? rewriteKnownUrl(block.poster, manifest, assetBaseUrl) : block.poster,
    };
  }

  if (block.type === "cards") {
    return {
      ...block,
      cards: block.cards.map((card) => ({
        ...card,
        image: card.image ? rewriteKnownUrl(card.image, manifest, assetBaseUrl) : card.image,
      })),
    };
  }

  if (block.type === "icon-grid") {
    return {
      ...block,
      icons: block.icons.map((icon) => ({
        ...icon,
        url: rewriteKnownUrl(icon.url, manifest, assetBaseUrl),
      })),
    };
  }

  return block;
}

export function rewriteCMSMediaUrls(data: CMSData, manifest: MediaManifest, options: { assetBaseUrl?: string } = {}) {
  const normalized = normalizeCMSData(data);
  const assetBaseUrl = options.assetBaseUrl;

  return normalizeCMSData({
    ...normalized,
    profile: {
      ...normalized.profile,
      photo: rewriteKnownUrl(normalized.profile.photo, manifest, assetBaseUrl),
    },
    siteSettings: {
      ...normalized.siteSettings,
      homeGalleryItems: normalized.siteSettings.homeGalleryItems.map((item) => ({
        ...item,
        image: rewriteKnownUrl(item.image, manifest, assetBaseUrl),
      })),
      projectCardOverrides: Object.fromEntries(
        Object.entries(normalized.siteSettings.projectCardOverrides).map(([id, override]) => [
          id,
          {
            ...override,
            image: override.image ? rewriteKnownUrl(override.image, manifest, assetBaseUrl) : override.image,
          },
        ]),
      ),
      blogPostCardOverrides: Object.fromEntries(
        Object.entries(normalized.siteSettings.blogPostCardOverrides).map(([id, override]) => [
          id,
          {
            ...override,
            image: override.image ? rewriteKnownUrl(override.image, manifest, assetBaseUrl) : override.image,
          },
        ]),
      ),
    },
    stack: normalized.stack.map((item) => ({
      ...item,
      logo: item.logo ? rewriteKnownUrl(item.logo, manifest, assetBaseUrl) : item.logo,
    })),
    media: normalized.media.map((item) => ({
      ...item,
      url: rewriteKnownUrl(item.url, manifest, assetBaseUrl),
    })),
    projects: normalized.projects.map((project) => ({
      ...project,
      image: rewriteKnownUrl(project.image, manifest, assetBaseUrl),
      cardImage: project.cardImage ? rewriteKnownUrl(project.cardImage, manifest, assetBaseUrl) : project.cardImage,
      galleryImages: project.galleryImages.map((url) => rewriteKnownUrl(url, manifest, assetBaseUrl)),
      contentBlocks: project.contentBlocks.map((block) => rewriteBlockMedia(block, manifest, assetBaseUrl)),
    })),
    blogPosts: normalized.blogPosts.map((post) => ({
      ...post,
      image: rewriteKnownUrl(post.image, manifest, assetBaseUrl),
      cardImage: post.cardImage ? rewriteKnownUrl(post.cardImage, manifest, assetBaseUrl) : post.cardImage,
      galleryImages: post.galleryImages?.map((url) => rewriteKnownUrl(url, manifest, assetBaseUrl)),
      contentBlocks: post.contentBlocks.map((block) => rewriteBlockMedia(block, manifest, assetBaseUrl)),
    })),
    pages: normalized.pages.map((page) => ({
      ...page,
      contentBlocks: page.contentBlocks.map((block) => rewriteBlockMedia(block, manifest, assetBaseUrl)),
    })),
  });
}
