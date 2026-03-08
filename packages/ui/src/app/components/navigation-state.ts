import type { Location } from "react-router";

export function buildBackTarget(location: Pick<Location, "pathname" | "search" | "hash">) {
  const target = `${location.pathname}${location.search}${location.hash}`.trim();
  return target || "/";
}

export function getBackTarget(state: unknown, fallback: string) {
  if (
    state &&
    typeof state === "object" &&
    "backTo" in state &&
    typeof (state as { backTo?: unknown }).backTo === "string"
  ) {
    const candidate = (state as { backTo: string }).backTo.trim();
    if (candidate.startsWith("/")) {
      return candidate;
    }
  }

  return fallback;
}
