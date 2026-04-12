import { useEffect, useMemo, useState } from "react";
import {
  History, X, Clock, ChevronRight, RotateCcw, Eye,
  ArrowLeft, Type, Heading1, Heading2, Heading3,
  List, ListOrdered, ImageIcon, Quote, MousePointerClick, Code, Palette,
  FileText,
} from "lucide-react";
import type { ContentEntityType } from "@portfolio/core";
import { type ContentBlock, type ContentStatus } from "./cms-data";
import { getContentStatusMeta } from "./content-status";
import { dataProvider } from "./data-provider";
import { richTextToPlainText } from "./rich-text";
import { getShowcaseBlockSummary, isShowcaseBlock } from "./showcase-blocks";
import { countListItems } from "./list-block-utils";

// --- Version types ---
export interface ContentVersion {
  id: string;
  timestamp: string;
  label: string; // "Autosave", "Manual save", "Published", etc.
  data: Record<string, any>;
}

function parseContentId(contentId: string): { entityType: ContentEntityType; entityId: string } {
  const separatorIndex = contentId.indexOf("-");
  const rawType = separatorIndex >= 0 ? contentId.slice(0, separatorIndex) : contentId;
  const entityId = separatorIndex >= 0 ? contentId.slice(separatorIndex + 1) : contentId;

  const entityType =
    rawType === "projects"
      ? "project"
      : rawType === "articles"
      ? "blog_post"
      : rawType === "pages"
      ? "page"
      : (rawType as ContentEntityType);

  return { entityType, entityId };
}

// --- Storage helpers (delegated to dataProvider) ---
export async function getVersions(contentId: string): Promise<ContentVersion[]> {
  const { entityType, entityId } = parseContentId(contentId);
  const versions = await dataProvider.loadVersions(entityType, entityId);
  return versions.map((version) => ({
    id: version.id,
    timestamp: version.createdAt,
    label: version.label,
    data: version.snapshot,
  }));
}

export function saveVersion(contentId: string, data: Record<string, any>, label: string) {
  const { entityType, entityId } = parseContentId(contentId);
  return dataProvider.saveVersion(entityType, entityId, data, label);
}

// --- Diff logic ---
type DiffType = "added" | "removed" | "changed" | "unchanged";

interface FieldDiff {
  field: string;
  type: DiffType;
  oldValue?: any;
  newValue?: any;
}

function getBlockSummary(block: ContentBlock): string {
  const labels: Record<string, string> = {
    paragraph: "Paragrafo", heading1: "H1", heading2: "H2", heading3: "H3",
    "unordered-list": "Lista", "ordered-list": "Lista numerada",
    "style-guide": "Style guide", "color-palette": "Paleta de cores", typography: "Tipografia",
    "icon-grid": "Icones", "user-flow": "Fluxo do usuario", sitemap: "Sitemap",
    code: "Codigo", image: "Imagem", divider: "Divisor", quote: "Citacao", cta: "CTA", embed: "Embed",
  };
  const label = labels[block.type] || block.type;
  if (isShowcaseBlock(block)) {
    return getShowcaseBlockSummary(block);
  }
  if ("text" in block && block.text) {
    const preview = richTextToPlainText((block as any).text).substring(0, 60);
    return `${label}: ${preview}${preview.length >= 60 ? "..." : ""}`;
  }
  if ("items" in block) {
    return `${label}: ${countListItems((block as any).items)} itens`;
  }
  if ("code" in block && block.type === "code") {
    const preview = block.code.substring(0, 60);
    return `${label} (${block.language}): ${preview}${block.code.length > 60 ? "..." : ""}`;
  }
  if ("url" in block && block.type === "image") {
    return `${label}: ${richTextToPlainText((block as any).caption) || "sem legenda"}`;
  }
  return label;
}

function computeDiff(oldData: Record<string, any>, newData: Record<string, any>): FieldDiff[] {
  const diffs: FieldDiff[] = [];
  const skipFields = new Set(["updatedAt", "createdAt"]);
  const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);

  for (const key of allKeys) {
    if (skipFields.has(key)) continue;
    const oldVal = oldData?.[key];
    const newVal = newData?.[key];

    if (oldVal === undefined && newVal !== undefined) {
      diffs.push({ field: key, type: "added", newValue: newVal });
    } else if (oldVal !== undefined && newVal === undefined) {
      diffs.push({ field: key, type: "removed", oldValue: oldVal });
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diffs.push({ field: key, type: "changed", oldValue: oldVal, newValue: newVal });
    }
  }
  return diffs;
}

// --- Field labels ---
const FIELD_LABELS: Record<string, string> = {
  title: "Titulo", subtitle: "Subtitulo", category: "Categoria",
  services: "Servicos", client: "Cliente", year: "Ano",
  image: "Imagem de capa", galleryImages: "Galeria", link: "Link externo",
  slug: "Slug", description: "Descricao", contentBlocks: "Blocos de conteudo",
  status: "Status", tags: "Tags", featured: "Destacado",
  seoTitle: "Titulo SEO", seoDescription: "Descricao SEO",
  publisher: "Publicacao", date: "Data", author: "Autor",
  readTime: "Tempo de leitura", content: "Conteudo legado",
  name: "Nome", role: "Cargo", quote: "Citacao",
};

function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] || field;
}

// --- Block diff icons ---
function BlockIcon({ type }: { type: string }) {
  const size = 12;
  switch (type) {
    case "paragraph": return <Type size={size} />;
    case "heading1": return <Heading1 size={size} />;
    case "heading2": return <Heading2 size={size} />;
    case "heading3": return <Heading3 size={size} />;
    case "unordered-list": return <List size={size} />;
    case "ordered-list": return <ListOrdered size={size} />;
    case "style-guide": return <Palette size={size} />;
    case "color-palette": return <Palette size={size} />;
    case "typography": return <Type size={size} />;
    case "icon-grid": return <ImageIcon size={size} />;
    case "user-flow": return <ListOrdered size={size} />;
    case "sitemap": return <List size={size} />;
    case "code": return <Code size={size} />;
    case "image": return <ImageIcon size={size} />;
    case "quote": return <Quote size={size} />;
    case "cta": return <MousePointerClick size={size} />;
    case "embed": return <Code size={size} />;
    default: return <FileText size={size} />;
  }
}

// --- Render field value ---
function renderValue(value: any, field: string): React.ReactNode {
  if (value === null || value === undefined || value === "") {
    return <span className="text-[#555] italic" style={{ fontSize: "12px" }}>vazio</span>;
  }
  if (field === "status") {
    const statusMeta = getContentStatusMeta((value || "draft") as ContentStatus);
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusMeta.color }} />
        <span style={{ fontSize: "12px" }}>{statusMeta.label}</span>
      </span>
    );
  }
  if (field === "featured") {
    return <span style={{ fontSize: "12px" }}>{value ? "Sim" : "Nao"}</span>;
  }
  if (field === "tags" && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((t: string) => (
          <span key={t} className="px-1.5 py-0.5 rounded text-[#aaa]" style={{ fontSize: "10px", backgroundColor: "#1e1e1e" }}>{t}</span>
        ))}
      </div>
    );
  }
  if (field === "contentBlocks" && Array.isArray(value)) {
    return (
      <div className="space-y-1">
        {value.map((block: ContentBlock, i: number) => (
          <div key={i} className="flex items-center gap-1.5 text-[#aaa]" style={{ fontSize: "11px" }}>
            <BlockIcon type={block.type} />
            <span className="truncate max-w-[200px]">{getBlockSummary(block)}</span>
          </div>
        ))}
        {value.length === 0 && <span className="text-[#555] italic" style={{ fontSize: "11px" }}>sem blocos</span>}
      </div>
    );
  }
  if (field === "galleryImages" && Array.isArray(value)) {
    return <span style={{ fontSize: "12px" }}>{value.length} imagens</span>;
  }
  if (typeof value === "string" && value.length > 100) {
    const plainValue = richTextToPlainText(value);
    return <span style={{ fontSize: "12px" }} className="break-all">{plainValue.substring(0, 100)}...</span>;
  }
  if (typeof value === "string") {
    return <span style={{ fontSize: "12px" }}>{richTextToPlainText(value)}</span>;
  }
  return <span style={{ fontSize: "12px" }}>{String(value)}</span>;
}

// --- Block-level diff ---
function BlocksDiff({ oldBlocks, newBlocks }: { oldBlocks: ContentBlock[]; newBlocks: ContentBlock[] }) {
  const old = oldBlocks || [];
  const cur = newBlocks || [];
  const maxLen = Math.max(old.length, cur.length);

  if (maxLen === 0) {
    return <span className="text-[#555] italic" style={{ fontSize: "11px" }}>sem blocos</span>;
  }

  return (
    <div className="space-y-1.5">
      {Array.from({ length: maxLen }).map((_, i) => {
        const oldBlock = old[i];
        const newBlock = cur[i];
        const bothExist = oldBlock && newBlock;
        const same = bothExist && JSON.stringify(oldBlock) === JSON.stringify(newBlock);
        const onlyOld = oldBlock && !newBlock;
        const onlyNew = !oldBlock && newBlock;

        if (same) return null; // skip unchanged

        return (
          <div key={i} className="rounded-md overflow-hidden" style={{ border: "1px solid #1e1e1e" }}>
            <div className="flex items-center gap-1.5 px-2 py-1" style={{ backgroundColor: "#141414", fontSize: "10px" }}>
              <span className="text-[#666]">Bloco {i + 1}</span>
              {onlyOld && <span className="text-red-400 ml-auto">Removido</span>}
              {onlyNew && <span className="text-green-400 ml-auto">Adicionado</span>}
              {bothExist && !same && <span className="text-yellow-400 ml-auto">Alterado</span>}
            </div>
            <div className="grid grid-cols-2 divide-x divide-[#1e1e1e]">
              {/* Old */}
              <div className={`px-2 py-1.5 ${onlyOld ? "bg-red-500/5" : ""}`}>
                {oldBlock ? (
                  <div className="flex items-start gap-1.5 text-[#888]" style={{ fontSize: "11px" }}>
                    <BlockIcon type={oldBlock.type} />
                    <span className="truncate">{getBlockSummary(oldBlock)}</span>
                  </div>
                ) : (
                  <span className="text-[#333] italic" style={{ fontSize: "11px" }}>—</span>
                )}
              </div>
              {/* New */}
              <div className={`px-2 py-1.5 ${onlyNew ? "bg-green-500/5" : ""}`}>
                {newBlock ? (
                  <div className="flex items-start gap-1.5 text-[#ccc]" style={{ fontSize: "11px" }}>
                    <BlockIcon type={newBlock.type} />
                    <span className="truncate">{getBlockSummary(newBlock)}</span>
                  </div>
                ) : (
                  <span className="text-[#333] italic" style={{ fontSize: "11px" }}>—</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Diff viewer component ---
function DiffViewer({ oldVersion, newVersion }: { oldVersion: ContentVersion; newVersion: ContentVersion }) {
  const diffs = useMemo(() => computeDiff(oldVersion.data, newVersion.data), [oldVersion, newVersion]);

  const changedDiffs = diffs.filter(d => d.type !== "unchanged");

  if (changedDiffs.length === 0) {
    return (
      <div className="text-center py-8 text-[#555]" style={{ fontSize: "13px" }}>
        Nenhuma alteracao entre estas versoes
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1 text-[#555]" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        <span>{changedDiffs.length} campo{changedDiffs.length > 1 ? "s" : ""} alterado{changedDiffs.length > 1 ? "s" : ""}</span>
      </div>

      {changedDiffs.map((diff) => (
        <div key={diff.field} className="rounded-lg overflow-hidden" style={{ border: "1px solid #1e1e1e", backgroundColor: "#111" }}>
          {/* Field header */}
          <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: "#0e0e0e", borderBottom: "1px solid #1e1e1e" }}>
            <span className="text-[#aaa]" style={{ fontSize: "12px" }}>{getFieldLabel(diff.field)}</span>
            <span
              className="px-1.5 py-0.5 rounded"
              style={{
                fontSize: "10px",
                backgroundColor: diff.type === "added" ? "#00ff3c15" : diff.type === "removed" ? "#ff000015" : "#ffa50015",
                color: diff.type === "added" ? "#00ff3c" : diff.type === "removed" ? "#ff4444" : "#ffa500",
              }}
            >
              {diff.type === "added" ? "Adicionado" : diff.type === "removed" ? "Removido" : "Alterado"}
            </span>
          </div>

          {/* Diff content */}
          {diff.field === "contentBlocks" ? (
            <div className="p-3">
              <BlocksDiff oldBlocks={diff.oldValue} newBlocks={diff.newValue} />
            </div>
          ) : (
            <div className="grid grid-cols-2 divide-x divide-[#1e1e1e]">
              <div className="p-3">
                <div className="text-[#555] mb-1" style={{ fontSize: "10px", textTransform: "uppercase" }}>Anterior</div>
                <div className={diff.type === "removed" ? "text-red-400" : "text-[#888]"}>
                  {diff.oldValue !== undefined ? renderValue(diff.oldValue, diff.field) : (
                    <span className="text-[#333] italic" style={{ fontSize: "12px" }}>—</span>
                  )}
                </div>
              </div>
              <div className="p-3">
                <div className="text-[#555] mb-1" style={{ fontSize: "10px", textTransform: "uppercase" }}>Atual</div>
                <div className={diff.type === "added" ? "text-green-400" : "text-[#ccc]"}>
                  {diff.newValue !== undefined ? renderValue(diff.newValue, diff.field) : (
                    <span className="text-[#333] italic" style={{ fontSize: "12px" }}>—</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// --- Main Version History Panel ---
export function VersionHistoryPanel({ contentId, currentData, onRestore, onClose }: {
  contentId: string;
  currentData: Record<string, any>;
  onRestore: (data: Record<string, any>) => void;
  onClose: () => void;
}) {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [comparing, setComparing] = useState(false);
  const [compareFrom, setCompareFrom] = useState<number | null>(null);
  const [compareTo, setCompareTo] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    void getVersions(contentId)
      .then((items) => {
        if (active) setVersions(items);
      })
      .catch(() => {
        if (active) setVersions([]);
      });

    return () => {
      active = false;
    };
  }, [contentId]);

  // Create a virtual "current" version for comparison
  const currentVersion: ContentVersion = useMemo(() => ({
    id: "current",
    timestamp: new Date().toISOString(),
    label: "Estado atual",
    data: currentData,
  }), [currentData]);

  const allVersions = useMemo(() => [currentVersion, ...versions], [currentVersion, versions]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Agora";
    if (diffMin < 60) return `${diffMin} min atras`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h atras`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d atras`;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const labelColors: Record<string, string> = {
    "Autosave": "#ffa500",
    "Salvo manualmente": "#3b82f6",
    "Publicado": "#00ff3c",
    "Estado atual": "#a855f7",
  };

  const handleCompare = () => {
    if (selectedIndex !== null) {
      setCompareFrom(0); // current
      setCompareTo(selectedIndex);
      setComparing(true);
    }
  };

  const handleCustomCompare = (fromIdx: number, toIdx: number) => {
    setCompareFrom(fromIdx);
    setCompareTo(toIdx);
    setComparing(true);
  };

  const handleRestore = (versionData: Record<string, any>) => {
    onRestore(versionData);
    onClose();
  };

  // Diff view
  if (comparing && compareFrom !== null && compareTo !== null) {
    const fromV = allVersions[compareFrom];
    const toV = allVersions[compareTo];
    if (!fromV || !toV) {
      setComparing(false);
      return null;
    }

    return (
      <div className="fixed inset-0 z-50 flex">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative ml-auto w-full max-w-[700px] h-full overflow-hidden flex flex-col" style={{ backgroundColor: "#0e0e0e" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-12 shrink-0" style={{ borderBottom: "1px solid #1e1e1e" }}>
            <div className="flex items-center gap-2">
              <button onClick={() => setComparing(false)} className="text-[#666] hover:text-[#aaa] cursor-pointer p-1">
                <ArrowLeft size={14} />
              </button>
              <span className="text-[#fafafa]" style={{ fontSize: "13px" }}>Comparacao de versoes</span>
            </div>
            <button onClick={onClose} className="text-[#666] hover:text-[#aaa] cursor-pointer p-1">
              <X size={14} />
            </button>
          </div>

          {/* Version labels */}
          <div className="grid grid-cols-2 divide-x divide-[#1e1e1e] shrink-0" style={{ borderBottom: "1px solid #1e1e1e" }}>
            <div className="px-4 py-2">
              <div className="text-[#555]" style={{ fontSize: "10px", textTransform: "uppercase" }}>De (anterior)</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: labelColors[toV.label] || "#666" }} />
                <span className="text-[#aaa]" style={{ fontSize: "12px" }}>{toV.label}</span>
                <span className="text-[#555]" style={{ fontSize: "11px" }}>{formatDate(toV.timestamp)}</span>
              </div>
            </div>
            <div className="px-4 py-2">
              <div className="text-[#555]" style={{ fontSize: "10px", textTransform: "uppercase" }}>Para (atual)</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: labelColors[fromV.label] || "#666" }} />
                <span className="text-[#aaa]" style={{ fontSize: "12px" }}>{fromV.label}</span>
                <span className="text-[#555]" style={{ fontSize: "11px" }}>{formatDate(fromV.timestamp)}</span>
              </div>
            </div>
          </div>

          {/* Diff content */}
          <div className="flex-1 overflow-y-auto p-4">
            <DiffViewer oldVersion={toV} newVersion={fromV} />
          </div>

          {/* Restore button */}
          {toV.id !== "current" && (
            <div className="shrink-0 px-4 py-3" style={{ borderTop: "1px solid #1e1e1e" }}>
              <button
                onClick={() => handleRestore(toV.data)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors text-[#111] hover:opacity-90"
                style={{ fontSize: "13px", backgroundColor: "#ffa500" }}
              >
                <RotateCcw size={14} /> Restaurar esta versao
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Version list view
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-[400px] h-full overflow-hidden flex flex-col" style={{ backgroundColor: "#0e0e0e" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-12 shrink-0" style={{ borderBottom: "1px solid #1e1e1e" }}>
          <div className="flex items-center gap-2">
            <History size={14} className="text-[#888]" />
            <span className="text-[#fafafa]" style={{ fontSize: "13px" }}>Historico de versoes</span>
            <span className="text-[#555]" style={{ fontSize: "11px" }}>({versions.length})</span>
          </div>
          <button onClick={onClose} className="text-[#666] hover:text-[#aaa] cursor-pointer p-1">
            <X size={14} />
          </button>
        </div>

        {/* Version list */}
        <div className="flex-1 overflow-y-auto">
          {allVersions.length <= 1 ? (
            <div className="text-center py-12 px-4">
              <Clock size={24} className="text-[#333] mx-auto mb-3" />
              <p className="text-[#555]" style={{ fontSize: "13px" }}>Nenhuma versao anterior</p>
              <p className="text-[#444] mt-1" style={{ fontSize: "11px" }}>As versoes serao salvas automaticamente ao editar</p>
            </div>
          ) : (
            <div className="py-2">
              {allVersions.map((version, idx) => {
                const isSelected = selectedIndex === idx;
                const isCurrent = idx === 0;

                return (
                  <button
                    key={version.id}
                    onClick={() => setSelectedIndex(isSelected ? null : idx)}
                    className={`w-full text-left px-4 py-3 cursor-pointer transition-colors relative ${
                      isSelected ? "bg-[#1a1a1a]" : "hover:bg-[#141414]"
                    }`}
                    style={{ borderBottom: "1px solid #141414" }}
                  >
                    {/* Timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-px" style={{ backgroundColor: idx === allVersions.length - 1 ? "transparent" : "#1e1e1e" }} />

                    <div className="flex items-start gap-3 relative">
                      {/* Timeline dot */}
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 mt-1 relative z-10"
                        style={{
                          backgroundColor: labelColors[version.label] || "#666",
                          boxShadow: `0 0 0 3px #0e0e0e`,
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[#ccc]" style={{ fontSize: "12px" }}>{version.label}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[#a855f7]" style={{ fontSize: "9px", backgroundColor: "#a855f715" }}>
                              ATUAL
                            </span>
                          )}
                        </div>
                        <span className="text-[#555] block mt-0.5" style={{ fontSize: "11px" }}>
                          {formatDate(version.timestamp)}
                        </span>

                        {/* Quick diff summary */}
                        {isSelected && !isCurrent && (
                          <div className="mt-2 space-y-2">
                            {/* Quick changes count */}
                            {(() => {
                              const diffs = computeDiff(version.data, currentData);
                              const changed = diffs.filter(d => d.type !== "unchanged");
                              return (
                                <div className="text-[#666]" style={{ fontSize: "11px" }}>
                                  {changed.length} campo{changed.length !== 1 ? "s" : ""} diferente{changed.length !== 1 ? "s" : ""} do estado atual
                                </div>
                              );
                            })()}

                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCompare(); }}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[#ccc] hover:text-white transition-colors"
                                style={{ fontSize: "11px", backgroundColor: "#1e1e1e", border: "1px solid #2a2a2a" }}
                              >
                                <Eye size={11} /> Ver diff
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRestore(version.data); }}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[#ffa500] hover:text-[#ffb84d] transition-colors"
                                style={{ fontSize: "11px", backgroundColor: "#ffa50010", border: "1px solid #ffa50030" }}
                              >
                                <RotateCcw size={11} /> Restaurar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <ChevronRight
                        size={12}
                        className={`text-[#444] shrink-0 mt-1 transition-transform ${isSelected ? "rotate-90" : ""}`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Compare any two versions */}
        {versions.length >= 2 && (
          <div className="shrink-0 px-4 py-3 space-y-2" style={{ borderTop: "1px solid #1e1e1e" }}>
            <div className="text-[#555]" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Comparar versoes
            </div>
            <div className="flex items-center gap-2">
              <select
                value={compareFrom ?? ""}
                onChange={(e) => setCompareFrom(e.target.value ? Number(e.target.value) : null)}
                className="flex-1 rounded-md px-2 py-1.5 text-[#ccc] focus:outline-none cursor-pointer"
                style={{ fontSize: "11px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
              >
                <option value="">De...</option>
                {allVersions.map((v, i) => (
                  <option key={v.id} value={i}>
                    {v.label} — {formatDate(v.timestamp)}
                  </option>
                ))}
              </select>
              <span className="text-[#444]" style={{ fontSize: "11px" }}>→</span>
              <select
                value={compareTo ?? ""}
                onChange={(e) => setCompareTo(e.target.value ? Number(e.target.value) : null)}
                className="flex-1 rounded-md px-2 py-1.5 text-[#ccc] focus:outline-none cursor-pointer"
                style={{ fontSize: "11px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
              >
                <option value="">Para...</option>
                {allVersions.map((v, i) => (
                  <option key={v.id} value={i}>
                    {v.label} — {formatDate(v.timestamp)}
                  </option>
                ))}
              </select>
            </div>
            {compareFrom !== null && compareTo !== null && compareFrom !== compareTo && (
              <button
                onClick={() => handleCustomCompare(compareFrom, compareTo)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[#ccc] hover:text-white transition-colors cursor-pointer"
                style={{ fontSize: "12px", backgroundColor: "#1e1e1e", border: "1px solid #2a2a2a" }}
              >
                <Eye size={12} /> Comparar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
