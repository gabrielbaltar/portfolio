import type { ContentStatus } from "@portfolio/core";

export type ManagedContentType = "projects" | "articles" | "pages";

type StatusMeta = {
  label: string;
  color: string;
  bg: string;
};

const CONTENT_STATUS_META: Record<ContentStatus, StatusMeta> = {
  draft: { label: "Rascunho", color: "#ffa500", bg: "#ffa50014" },
  review: { label: "Em revisao", color: "#3b82f6", bg: "#3b82f614" },
  under_construction: { label: "Em construcao", color: "#f97316", bg: "#f9731614" },
  published: { label: "Publicado", color: "#00ff3c", bg: "#00ff3c14" },
  archived: { label: "Arquivado", color: "#888", bg: "#55555514" },
};

const DEFAULT_CONTENT_STATUSES: ContentStatus[] = ["draft", "review", "published", "archived"];
const PROJECT_CONTENT_STATUSES: ContentStatus[] = ["draft", "review", "under_construction", "published", "archived"];

export function getContentStatusMeta(status: ContentStatus) {
  return CONTENT_STATUS_META[status];
}

export function getAvailableContentStatuses(contentType: ManagedContentType): ContentStatus[] {
  return contentType === "projects" ? PROJECT_CONTENT_STATUSES : DEFAULT_CONTENT_STATUSES;
}
