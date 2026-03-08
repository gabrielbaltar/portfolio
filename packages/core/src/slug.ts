import { RESERVED_PAGE_SLUGS } from "./constants";

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ensureUniqueSlug(base: string, existingSlugs: Iterable<string>, fallback = "item"): string {
  const normalized = slugify(base) || fallback;
  const taken = new Set(Array.from(existingSlugs, (slug) => slug.toLowerCase()));

  if (!taken.has(normalized.toLowerCase())) {
    return normalized;
  }

  let counter = 2;
  let candidate = `${normalized}-${counter}`;
  while (taken.has(candidate.toLowerCase())) {
    counter += 1;
    candidate = `${normalized}-${counter}`;
  }
  return candidate;
}

export function isReservedPageSlug(slug: string): boolean {
  return RESERVED_PAGE_SLUGS.has(slugify(slug));
}
