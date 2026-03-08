export function getVisiblePublicTags(tags?: string[] | null): string[] {
  if (!tags || tags.length === 0) return [];

  return tags.filter((tag) => tag.trim().toLowerCase() !== "cms");
}
