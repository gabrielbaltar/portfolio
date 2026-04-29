import type {
  ContentStatus,
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
  "custom",
  "gallery",
  "awards",
  "recommendations",
  "blog",
  "contact",
];

export const PUBLIC_PROJECT_STATUSES: ContentStatus[] = ["published", "under_construction"];

export function normalizePortfolioSectionOrder(order: unknown): PortfolioSectionId[] {
  const normalized: PortfolioSectionId[] = [];
  const seen = new Set<PortfolioSectionId>();

  if (Array.isArray(order)) {
    order.forEach((value) => {
      if (
        typeof value === "string" &&
        PORTFOLIO_SECTION_IDS.includes(value as PortfolioSectionId) &&
        !seen.has(value as PortfolioSectionId)
      ) {
        normalized.push(value as PortfolioSectionId);
        seen.add(value as PortfolioSectionId);
      }
    });
  }

  PORTFOLIO_SECTION_IDS.forEach((sectionId) => {
    if (!seen.has(sectionId)) {
      normalized.push(sectionId);
    }
  });

  return normalized;
}

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

export function isPublicProjectStatus(status: ContentStatus | null | undefined) {
  return !status || PUBLIC_PROJECT_STATUSES.includes(status);
}
