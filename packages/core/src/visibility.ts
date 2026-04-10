import type {
  PortfolioSectionId,
  PublicContentVisibilityCollection,
  SiteSettings,
} from "./types";

export const PORTFOLIO_SECTION_IDS: PortfolioSectionId[] = [
  "about",
  "projects",
  "experience",
  "education",
  "certifications",
  "stack",
  "gallery",
  "awards",
  "recommendations",
  "blog",
  "contact",
];

export function getPublicContentVisibilityKey(
  collection: PublicContentVisibilityCollection,
  id: string,
) {
  return `${collection}:${id}`;
}

export function isPortfolioSectionVisible(
  settings: Pick<SiteSettings, "sectionVisibility"> | null | undefined,
  section: PortfolioSectionId,
) {
  return settings?.sectionVisibility?.[section] !== false;
}

export function isPublicContentVisible(
  settings: Pick<SiteSettings, "contentVisibility"> | null | undefined,
  collection: PublicContentVisibilityCollection,
  id: string,
) {
  return settings?.contentVisibility?.[getPublicContentVisibilityKey(collection, id)] !== false;
}
