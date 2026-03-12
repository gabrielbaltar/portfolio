import {
  isPortfolioSectionVisible,
  isPublicContentVisible,
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
