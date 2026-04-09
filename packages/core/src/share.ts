import type { BlogPost, SiteSettings } from "./types";

type ArticleSeoDataOptions = {
  articleUrl?: string | null;
  siteUrl?: string | null;
  locale?: string | null;
  fallbackTitle?: string | null;
};

const HTML_ENTITY_REPLACEMENTS: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

function decodeHtmlEntities(value: string) {
  return Object.entries(HTML_ENTITY_REPLACEMENTS).reduce(
    (current, [entity, replacement]) => current.replaceAll(entity, replacement),
    value,
  );
}

export function richTextToPlainText(value?: string | null) {
  const normalized = value?.trim() || "";
  if (!normalized) return "";

  return decodeHtmlEntities(
    normalized
      .replace(/<br\b[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

export function trimTrailingSlash(value?: string | null) {
  const normalized = value?.trim() || "";
  if (!normalized) return "";
  return normalized.replace(/\/+$/, "");
}

export function buildAbsoluteUrl(value?: string | null, baseUrl?: string | null) {
  const normalizedValue = value?.trim() || "";
  if (!normalizedValue) return "";

  if (/^[a-z][a-z0-9+.-]*:/i.test(normalizedValue)) {
    return normalizedValue;
  }

  const normalizedBaseUrl = trimTrailingSlash(baseUrl);
  if (!normalizedBaseUrl) {
    return normalizedValue;
  }

  try {
    return new URL(normalizedValue, `${normalizedBaseUrl}/`).toString();
  } catch {
    return normalizedValue;
  }
}

function normalizeOpenGraphLocale(locale?: string | null) {
  if (locale === "en-US") return "en_US";
  if (locale === "pt-BR") return "pt_BR";
  return "pt_BR";
}

function pickFirstNonEmpty(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const normalized = richTextToPlainText(value);
    if (normalized) return normalized;
  }

  return "";
}

export function buildArticleSeoData(
  post: Pick<BlogPost, "title" | "subtitle" | "description" | "seoTitle" | "seoDescription" | "image">,
  siteSettings?: Pick<SiteSettings, "siteTitle" | "siteDescription"> | null,
  options: ArticleSeoDataOptions = {},
) {
  const siteName = pickFirstNonEmpty(siteSettings?.siteTitle, options.fallbackTitle, "Portfolio");
  const title = pickFirstNonEmpty(post.seoTitle, post.title, "Artigo");
  const description = pickFirstNonEmpty(
    post.seoDescription,
    post.subtitle,
    post.description,
    siteSettings?.siteDescription,
    title,
  );
  const articleUrl = buildAbsoluteUrl(options.articleUrl, options.siteUrl);
  const imageUrl = buildAbsoluteUrl(post.image, options.siteUrl);

  return {
    title,
    description,
    url: articleUrl,
    imageUrl,
    siteName,
    locale: normalizeOpenGraphLocale(options.locale),
    twitterCard: imageUrl ? "summary_large_image" : "summary",
  };
}
