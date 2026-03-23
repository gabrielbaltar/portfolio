import {
  type BlogPost,
  isPortfolioSectionVisible,
  isPublicContentVisible,
  type Project,
  type PortfolioSectionId,
  type PublicContentVisibilityCollection,
  type SiteSettings,
} from "@portfolio/core";

export function isSectionVisible(siteSettings: SiteSettings, section: PortfolioSectionId) {
  return isPortfolioSectionVisible(siteSettings, section);
}

export function filterVisibleContent<T extends { id: string }>(
  items: T[],
  siteSettings: SiteSettings,
  collection: PublicContentVisibilityCollection,
) {
  return items.filter((item) => isPublicContentVisible(siteSettings, collection, item.id));
}

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function getProjectCardCopy(
  project: Pick<Project, "id" | "title">,
  siteSettings: SiteSettings,
) {
  const override = siteSettings.projectCardOverrides?.[project.id];

  return {
    title: normalizeOptionalText(override?.title) || project.title,
    subtitle: normalizeOptionalText(override?.subtitle),
  };
}

export function getArticleCardCopy(
  post: Pick<BlogPost, "title" | "description" | "cardTitle" | "cardSubtitle">,
) {
  return {
    title: normalizeOptionalText(post.cardTitle) || post.title,
    description: normalizeOptionalText(post.cardSubtitle) || normalizeOptionalText(post.description),
  };
}
