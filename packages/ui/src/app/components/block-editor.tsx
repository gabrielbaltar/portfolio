import { useState, useRef, useCallback, useEffect } from "react";
import { useCMS, type ContentBlock } from "./cms-data";
import type { ContentCardItem, ContentListItem } from "@portfolio/core";
import {
  Plus, Trash2, GripVertical, Type, Heading1, Heading2, Heading3,
  List, ListOrdered, ImageIcon, Minus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Upload, X, Quote, MousePointerClick, Code, Video, Palette, LayoutGrid,
  Table2,
} from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
import { dataProvider } from "./data-provider";
import {
  clampBlockLineHeight,
  CODE_LANGUAGE_OPTIONS,
  getBlockLineHeight,
  isAdjustableLineHeightBlock,
} from "./content-block-utils";
import { LineHeightControl } from "./line-height-control";
import { ContentEmbed, resolveEmbed } from "./content-embed";
import { ImagePositionEditorCompact } from "./image-position-editor";
import { ImageLightbox, type LightboxOpenPayload } from "./image-lightbox";
import { RichTextEditor } from "./rich-text";
import {
  SelectionProtectedInput,
  SelectionProtectedTextarea,
} from "./text-protection";
import { ShowcaseBlockView } from "./showcase-blocks";
import { VideoPlayer } from "./video-player";
import { extractMuxPlaybackId, normalizeVideoInput } from "./video-source";
import { PreviewMediaSlider } from "./content-preview-cards";
import { ContentImage, canOpenInImageLightbox, isSupportedVisualUpload, supportsPositionEditor } from "./content-image";
import {
  appendChildListItem,
  createEmptyListItem,
  insertSiblingListItem,
  outdentListItem,
  removeListItem,
  updateListItemText,
  type ListItemPath,
} from "./list-block-utils";

const BLOCK_TYPES: { type: ContentBlock["type"]; label: string; icon: React.ReactNode }[] = [
  { type: "paragraph", label: "Paragrafo", icon: <Type size={14} /> },
  { type: "heading1", label: "Titulo H1", icon: <Heading1 size={14} /> },
  { type: "heading2", label: "Titulo H2", icon: <Heading2 size={14} /> },
  { type: "heading3", label: "Titulo H3", icon: <Heading3 size={14} /> },
  { type: "unordered-list", label: "Lista", icon: <List size={14} /> },
  { type: "ordered-list", label: "Lista numerada", icon: <ListOrdered size={14} /> },
  { type: "table", label: "Tabela simples", icon: <Table2 size={14} /> },
  { type: "style-guide", label: "Style guide", icon: <Palette size={14} /> },
  { type: "color-palette", label: "Paleta de cores", icon: <Palette size={14} /> },
  { type: "typography", label: "Tipografia", icon: <Type size={14} /> },
  { type: "icon-grid", label: "Icones", icon: <ImageIcon size={14} /> },
  { type: "user-flow", label: "Fluxo do usuario", icon: <ListOrdered size={14} /> },
  { type: "sitemap", label: "Sitemap", icon: <List size={14} /> },
  { type: "code", label: "Codigo", icon: <Code size={14} /> },
  { type: "image", label: "Imagem / Animacao", icon: <ImageIcon size={14} /> },
  { type: "video", label: "Video / Mux", icon: <Video size={14} /> },
  { type: "quote", label: "Citacao", icon: <Quote size={14} /> },
  { type: "cta", label: "CTA / Botao", icon: <MousePointerClick size={14} /> },
  { type: "cards", label: "Cards", icon: <LayoutGrid size={14} /> },
  { type: "embed", label: "Embed / Prototipo", icon: <Code size={14} /> },
  { type: "divider", label: "Divisor", icon: <Minus size={14} /> },
];

const LABEL_MAP: Record<string, string> = {
  paragraph: "Paragrafo", heading1: "H1", heading2: "H2", heading3: "H3",
  "unordered-list": "Lista", "ordered-list": "Lista numerada", table: "Tabela",
  "style-guide": "Style guide", "color-palette": "Cores", typography: "Tipografia",
  "icon-grid": "Icones", "user-flow": "Fluxo do usuario", sitemap: "Sitemap",
  code: "Codigo", image: "Imagem / Animacao", video: "Video", divider: "Divisor", quote: "Citacao", cta: "CTA", cards: "Cards", embed: "Embed / Prototipo",
};

const DND_ITEM_TYPE = "CONTENT_BLOCK";

interface DragItem {
  index: number;
  type: string;
}

function createBlock(type: ContentBlock["type"]): ContentBlock {
  switch (type) {
    case "paragraph": return { type: "paragraph", text: "" };
    case "heading1": return { type: "heading1", text: "", showInSummary: false };
    case "heading2": return { type: "heading2", text: "", showInSummary: false };
    case "heading3": return { type: "heading3", text: "", showInSummary: false };
    case "unordered-list": return { type: "unordered-list", items: [createEmptyListItem()] };
    case "ordered-list": return { type: "ordered-list", items: [createEmptyListItem()] };
    case "table":
      return {
        type: "table",
        columns: ["Antes", "Depois"],
        rows: [
          ["", ""],
          ["", ""],
          ["", ""],
        ],
        caption: "",
        titleTextColor: "",
        titleFontSize: undefined,
        itemTextColor: "",
        itemFontSize: undefined,
      };
    case "style-guide":
      return {
        type: "style-guide",
        title: "Style guide",
        summary: "",
        showInSummary: false,
        principles: [
          { title: "Clareza", description: "Explique a direcao visual e a regra principal desta interface." },
          { title: "Consistencia", description: "Documente como a linguagem visual se repete ao longo do fluxo." },
        ],
      };
    case "color-palette":
      return {
        type: "color-palette",
        title: "Paleta de cores",
        showInSummary: false,
        colors: [
          { name: "Primary", token: "color.primary", hex: "#111827", role: "Primaria", usage: "Titulos, botoes e destaques" },
          { name: "Accent", token: "color.accent", hex: "#38BDF8", role: "Acento", usage: "Estados ativos, links e sinais visuais" },
        ],
      };
    case "typography":
      return {
        type: "typography",
        title: "Tipografia",
        showInSummary: false,
        fonts: [
          { label: "Heading", token: "font.heading.lg", family: "Inter", weight: "600", size: "40px", lineHeight: "1.1", sample: "Build faster with better product thinking" },
          { label: "Body", token: "font.body.md", family: "Inter", weight: "400", size: "16px", lineHeight: "1.6", sample: "Readable, calm and structured content for product storytelling." },
        ],
      };
    case "icon-grid":
      return {
        type: "icon-grid",
        title: "Iconografia",
        showInSummary: false,
        icons: [
          { name: "Navigation", token: "icon.navigation.default", url: "", notes: "Use SVG para manter nitidez em qualquer tamanho." },
          { name: "Feedback", token: "icon.feedback.success", url: "", notes: "Agrupe icones por contexto de uso." },
        ],
      };
    case "user-flow":
      return {
        type: "user-flow",
        title: "Fluxo do usuario",
        showInSummary: false,
        steps: [
          { title: "Entrada", description: "Como o usuario chega na experiencia.", outcome: "Primeira impressao" },
          { title: "Acao principal", description: "A etapa central do fluxo e a decisao mais importante.", outcome: "Conversao" },
        ],
      };
    case "sitemap":
      return {
        type: "sitemap",
        title: "Sitemap",
        showInSummary: false,
        sections: [
          { title: "Landing", description: "Entrada principal do produto ou case.", children: ["Hero", "Proposta de valor", "CTA"] },
          { title: "Produto", description: "Navegacao das paginas internas.", children: ["Dashboard", "Detalhe", "Configuracoes"] },
        ],
      };
    case "code": return { type: "code", code: "", language: "typescript", caption: "" };
    case "image": return { type: "image", url: "", caption: "", galleryImages: [], galleryPositions: [] };
    case "video": return { type: "video", url: "", caption: "", poster: "", autoplay: false, loop: false, muted: false, previewStart: 0, previewDuration: 4, fit: "contain", zoom: 1 };
    case "quote": return { type: "quote", text: "", author: "" };
    case "cta": return { type: "cta", text: "", buttonText: "", buttonUrl: "", openInNewTab: true };
    case "cards":
      return {
        type: "cards",
        cards: [
          {
            title: "",
            description: "",
            image: "",
            imagePosition: "50% 50%",
            ctaText: "",
            ctaUrl: "",
            openInNewTab: true,
            backgroundColor: "#0F1012",
            borderColor: "#2A2A2A",
          },
        ],
      };
    case "embed": return { type: "embed", url: "", caption: "" };
    case "divider": return { type: "divider", spacing: 72, variant: "default" };
  }
}

function BlockTypeSelector({
  onSelect,
  compact = false,
}: {
  onSelect: (type: ContentBlock["type"]) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownH = Math.min(280, BLOCK_TYPES.length * 36 + 8);
      if (spaceBelow >= dropdownH + 8) {
        setPos({ top: rect.bottom + 4, left: rect.left });
      } else {
        setPos({ top: rect.top - dropdownH - 4, left: rect.left });
      }
    }
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className={
          compact
            ? "flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[#2f2f2f] px-3 py-2 text-[#777] transition-colors hover:border-[#555] hover:text-white cursor-pointer"
            : "flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#363636] text-[#ababab] hover:text-white hover:border-[#555] transition-colors cursor-pointer"
        }
        style={{ fontSize: compact ? "12px" : "13px", backgroundColor: compact ? "#0d0d0d" : undefined }}
      >
        <Plus size={14} /> {compact ? "Adicionar aqui" : "Adicionar bloco"}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed border border-[#363636] rounded-lg shadow-xl z-50 py-1 min-w-[220px] max-h-[280px] overflow-y-auto"
            style={{ top: pos.top, left: pos.left, backgroundColor: "#0e0e0e" }}
          >
            {BLOCK_TYPES.map((bt) => (
              <button
                key={bt.type}
                onClick={() => { onSelect(bt.type); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[#ccc] hover:bg-[#191919] hover:text-white transition-colors cursor-pointer text-left"
                style={{ fontSize: "13px" }}
              >
                <span className="opacity-70">{bt.icon}</span>
                {bt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function isUploadableVideoFile(file: File) {
  return file.type.startsWith("video/") || /\.(mp4|m4v|mov|webm|ogv|ogg)$/i.test(file.name);
}

function sanitizeHexColor(value?: string | null) {
  const normalized = (value || "").trim();
  if (!normalized) return undefined;
  if (/^#[\da-f]{3}$/i.test(normalized) || /^#[\da-f]{6}$/i.test(normalized)) return normalized;
  return undefined;
}

function parseOptionalFontSize(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : undefined;
}

function ListBlockEditor({
  items,
  onChange,
  ordered,
  lineHeight,
}: {
  items: ContentListItem[];
  onChange: (items: ContentListItem[]) => void;
  ordered: boolean;
  lineHeight: number;
}) {
  const renderListItem = (item: ContentListItem, path: ListItemPath, depth: number, index: number): React.ReactNode => {
    const children = item.children ?? [];

    return (
      <div key={path.join("-")} className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="w-5 shrink-0 pt-2 text-right text-[#555]" style={{ fontSize: "13px" }}>
            {ordered ? `${index + 1}.` : "\u2022"}
          </span>
          <div className="flex-1 space-y-2">
            <div className="flex items-start gap-2">
              <RichTextEditor
                value={item.text}
                onChange={(nextItem) => onChange(updateListItemText(items, path, nextItem))}
                onEnter={() => onChange(insertSiblingListItem(items, path))}
                onBackspaceEmpty={() => {
                  if (children.length > 0) return;
                  onChange(removeListItem(items, path));
                }}
                multiline={false}
                compact
                placeholder={depth > 0 ? "Subitem da lista..." : "Item da lista..."}
                containerClassName="flex-1"
                editorClassName="rounded px-2.5 py-1.5 text-[#fafafa]"
                editorStyle={{ fontSize: "14px", minHeight: "36px", backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", lineHeight: `${lineHeight}px` }}
                placeholderClassName="px-2.5 py-1.5"
              />
              <div className="flex shrink-0 items-center gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => onChange(insertSiblingListItem(items, path))}
                  className="rounded border border-[#2a2a2a] p-1 text-[#555] transition-colors hover:text-white"
                  title="Adicionar item abaixo"
                >
                  <Plus size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(appendChildListItem(items, path))}
                  className="rounded border border-[#2a2a2a] p-1 text-[#555] transition-colors hover:text-white"
                  title="Adicionar subitem"
                >
                  <ChevronRight size={12} />
                </button>
                {depth > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange(outdentListItem(items, path))}
                    className="rounded border border-[#2a2a2a] p-1 text-[#555] transition-colors hover:text-white"
                    title="Voltar um nivel"
                  >
                    <ChevronLeft size={12} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onChange(removeListItem(items, path))}
                  className="rounded border border-[#2a2a2a] p-1 text-[#555] transition-colors hover:text-red-400"
                  title="Remover item"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {children.length > 0 && (
              <div className="ml-3 border-l border-[#262626] pl-4">
                <div className="space-y-2">
                  {children.map((child, childIndex) => renderListItem(child, [...path, childIndex], depth + 1, childIndex))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-1.5">
      {items.length === 0 ? (
        <button
          type="button"
          onClick={() => onChange([createEmptyListItem()])}
          className="text-[#666] hover:text-[#aaa] flex items-center gap-1 cursor-pointer ml-7"
          style={{ fontSize: "12px" }}
        >
          <Plus size={12} /> Adicionar primeiro item
        </button>
      ) : (
        items.map((item, index) => renderListItem(item, [index], 0, index))
      )}
      <button
        type="button"
        onClick={() => onChange([...items, createEmptyListItem()])}
        className="text-[#666] hover:text-[#aaa] flex items-center gap-1 cursor-pointer ml-7"
        style={{ fontSize: "12px" }}
      >
        <Plus size={12} /> Adicionar item
      </button>
    </div>
  );
}

function TableBlockEditor({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "table" }>;
  onChange: (block: ContentBlock) => void;
}) {
  const columns = block.columns.length > 0 ? block.columns : ["Coluna 1", "Coluna 2"];
  const rows = block.rows.length > 0
    ? block.rows.map((row) => columns.map((_, columnIndex) => row[columnIndex] || ""))
    : [columns.map(() => "")];

  const emit = (nextColumns: string[], nextRows: string[][], caption = block.caption || "") => {
    onChange({
      ...block,
      columns: nextColumns,
      rows: nextRows.map((row) => nextColumns.map((_, columnIndex) => row[columnIndex] || "")),
      caption,
    } as ContentBlock);
  };

  const updateAppearance = (next: Partial<Extract<ContentBlock, { type: "table" }>>) => {
    onChange({ ...block, ...next } as ContentBlock);
  };

  const updateColumn = (columnIndex: number, value: string) => {
    const nextColumns = [...columns];
    nextColumns[columnIndex] = value;
    emit(nextColumns, rows);
  };

  const addColumn = () => {
    const nextColumns = [...columns, `Coluna ${columns.length + 1}`];
    emit(nextColumns, rows.map((row) => [...row, ""]));
  };

  const removeColumn = (columnIndex: number) => {
    if (columns.length <= 1) return;
    emit(
      columns.filter((_, index) => index !== columnIndex),
      rows.map((row) => row.filter((_, index) => index !== columnIndex)),
    );
  };

  const updateCell = (rowIndex: number, columnIndex: number, value: string) => {
    const nextRows = rows.map((row, currentRowIndex) =>
      currentRowIndex === rowIndex
        ? row.map((cell, currentColumnIndex) => currentColumnIndex === columnIndex ? value : cell)
        : row,
    );
    emit(columns, nextRows);
  };

  const addRow = () => {
    emit(columns, [...rows, columns.map(() => "")]);
  };

  const removeRow = (rowIndex: number) => {
    emit(columns, rows.filter((_, index) => index !== rowIndex));
  };

  return (
    <div className="space-y-3">
      <label className="space-y-1">
        <FieldLabel>Legenda opcional</FieldLabel>
        <MiniInput
          value={block.caption || ""}
          onChange={(caption) => emit(columns, rows, caption)}
          placeholder="Ex.: Comparativo antes e depois"
        />
      </label>

      <div className="rounded-lg border p-3" style={{ borderColor: "#2a2a2a", backgroundColor: "#101010" }}>
        <FieldLabel>Aparencia da tabela</FieldLabel>
        <div className="mt-2 grid grid-cols-1 gap-2 min-[720px]:grid-cols-4">
          <label className="space-y-1">
            <FieldLabel>Cor do titulo</FieldLabel>
            <ColorInput
              value={block.titleTextColor || ""}
              onChange={(titleTextColor) => updateAppearance({ titleTextColor })}
              placeholder="#fafafa"
            />
          </label>
          <label className="space-y-1">
            <FieldLabel>Tamanho titulo</FieldLabel>
            <MiniInput
              type="number"
              value={block.titleFontSize ? String(block.titleFontSize) : ""}
              onChange={(value) => updateAppearance({ titleFontSize: parseOptionalFontSize(value) })}
              placeholder="17"
            />
          </label>
          <label className="space-y-1">
            <FieldLabel>Cor dos itens</FieldLabel>
            <ColorInput
              value={block.itemTextColor || ""}
              onChange={(itemTextColor) => updateAppearance({ itemTextColor })}
              placeholder="#f3f3f3"
            />
          </label>
          <label className="space-y-1">
            <FieldLabel>Tamanho itens</FieldLabel>
            <MiniInput
              type="number"
              value={block.itemFontSize ? String(block.itemFontSize) : ""}
              onChange={(value) => updateAppearance({ itemFontSize: parseOptionalFontSize(value) })}
              placeholder="16"
            />
          </label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "#2a2a2a", backgroundColor: "#101010" }}>
        <div className="min-w-[520px]">
          <div
            className="grid border-b"
            style={{
              gridTemplateColumns: `repeat(${columns.length}, minmax(180px, 1fr))`,
              borderColor: "#2a2a2a",
            }}
          >
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="space-y-2 p-2" style={{ borderLeft: columnIndex === 0 ? undefined : "1px solid #242424" }}>
                <MiniInput
                  value={column}
                  onChange={(value) => updateColumn(columnIndex, value)}
                  placeholder={`Coluna ${columnIndex + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeColumn(columnIndex)}
                  disabled={columns.length <= 1}
                  className="inline-flex items-center gap-1 text-[#555] transition-colors hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                  style={{ fontSize: "11px" }}
                >
                  <Trash2 size={11} /> Remover coluna
                </button>
              </div>
            ))}
          </div>

          <div>
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="grid border-b last:border-b-0"
                style={{
                  gridTemplateColumns: `repeat(${columns.length}, minmax(180px, 1fr))`,
                  borderColor: "#222",
                }}
              >
                {columns.map((_, columnIndex) => (
                  <div key={columnIndex} className="p-2" style={{ borderLeft: columnIndex === 0 ? undefined : "1px solid #222" }}>
                    <MiniTextarea
                      value={row[columnIndex] || ""}
                      onChange={(value) => updateCell(rowIndex, columnIndex, value)}
                      rows={2}
                      placeholder={`Linha ${rowIndex + 1}`}
                    />
                  </div>
                ))}
                <div className="col-span-full flex justify-end px-2 pb-2">
                  <button
                    type="button"
                    onClick={() => removeRow(rowIndex)}
                    className="inline-flex items-center gap-1 text-[#555] transition-colors hover:text-red-400"
                    style={{ fontSize: "11px" }}
                  >
                    <Trash2 size={11} /> Remover linha
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-[#aaa] transition-colors hover:border-[#555] hover:text-white"
          style={{ borderColor: "#2a2a2a", fontSize: "12px" }}
        >
          <Plus size={12} /> Adicionar linha
        </button>
        <button
          type="button"
          onClick={addColumn}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-[#aaa] transition-colors hover:border-[#555] hover:text-white"
          style={{ borderColor: "#2a2a2a", fontSize: "12px" }}
        >
          <Plus size={12} /> Adicionar coluna
        </button>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[#666]" style={{ fontSize: "11px", lineHeight: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
      {children}
    </span>
  );
}

function canShowInSummary(block: ContentBlock) {
  return (
    block.type === "heading1" ||
    block.type === "heading2" ||
    block.type === "heading3" ||
    block.type === "style-guide" ||
    block.type === "color-palette" ||
    block.type === "typography" ||
    block.type === "icon-grid" ||
    block.type === "user-flow" ||
    block.type === "sitemap"
  );
}

function SummaryVisibilityControl({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { showInSummary?: boolean }>;
  onChange: (block: ContentBlock) => void;
}) {
  return (
    <label
      className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
      style={{ borderColor: "#252525", backgroundColor: "#101010" }}
    >
      <span className="min-w-0">
        <span className="block text-[#aaa]" style={{ fontSize: "12px", lineHeight: "18px" }}>
          Mostrar no sumario
        </span>
        <span className="block text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
          Quando marcado, este titulo aparece na navegacao lateral do portfolio.
        </span>
      </span>
      <input
        type="checkbox"
        checked={block.showInSummary === true}
        onChange={(event) => onChange({ ...block, showInSummary: event.target.checked } as ContentBlock)}
        className="h-4 w-4 shrink-0 accent-[#00ff3c]"
      />
    </label>
  );
}

function MiniInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
}) {
  return (
    <SelectionProtectedInput
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-[36px] w-full rounded border px-2.5 text-[#fafafa] focus:outline-none"
      style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", fontSize: "12px" }}
      placeholder={placeholder}
    />
  );
}

function MiniTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <SelectionProtectedTextarea
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full resize-none rounded border px-2.5 py-2 text-[#fafafa] focus:outline-none"
      style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", fontSize: "12px", lineHeight: "18px" }}
      placeholder={placeholder}
    />
  );
}

function ColorInput({
  value,
  onChange,
  placeholder,
}: {
  value?: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const resolvedColor = sanitizeHexColor(value) || placeholder;

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={resolvedColor}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-10 shrink-0 cursor-pointer rounded border-none p-0"
        style={{ backgroundColor: "transparent" }}
      />
      <SelectionProtectedInput
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="h-[36px] w-full rounded border px-2.5 text-[#fafafa] focus:outline-none"
        style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", fontSize: "12px" }}
        placeholder={placeholder}
      />
    </div>
  );
}

// Draggable block wrapper
function DraggableBlock({ block, index, total, onChange, onRemove, onMove, moveBlock }: {
  block: ContentBlock; index: number; total: number;
  onChange: (block: ContentBlock) => void; onRemove: () => void; onMove: (dir: -1 | 1) => void;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { addMediaItem } = useCMS();

  const [{ isDragging }, drag, preview] = useDrag({
    type: DND_ITEM_TYPE,
    item: (): DragItem => ({ index, type: DND_ITEM_TYPE }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: DND_ITEM_TYPE,
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only move when the mouse has crossed half of the item
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveBlock(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Connect drag and drop to the same ref
  preview(drop(ref));

  const fontSizeMap: Record<string, string> = { heading1: "20px", heading2: "17px", heading3: "15px", paragraph: "14px" };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const iconFileInputRef = useRef<HTMLInputElement>(null);
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [activeIconUploadIndex, setActiveIconUploadIndex] = useState<number | null>(null);
  const [iconUploadingIndex, setIconUploadingIndex] = useState<number | null>(null);
  const [dragOverIconIndex, setDragOverIconIndex] = useState<number | null>(null);
  const [activeCardUploadIndex, setActiveCardUploadIndex] = useState<number | null>(null);
  const blockLineHeight = isAdjustableLineHeightBlock(block) ? getBlockLineHeight(block) : null;
  const imageBlock = block.type === "image" ? block : null;
  const [imageLightbox, setImageLightbox] = useState<LightboxOpenPayload | null>(null);

  const moveItem = useCallback(<T,>(items: T[], fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return items;
    const nextItems = [...items];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem);
    return nextItems;
  }, []);

  const normalizeImageBlock = useCallback((currentBlock: Extract<ContentBlock, { type: "image" }>) => ({
    ...currentBlock,
    galleryImages: [...(currentBlock.galleryImages || [])],
    galleryPositions: [...(currentBlock.galleryPositions || [])],
  }), []);

  const replaceImageSlides = useCallback((slides: { src: string; position: string }[]) => {
    if (!imageBlock) return;

    const normalizedBlock = normalizeImageBlock(imageBlock);
    const [coverSlide, ...gallerySlides] = slides.filter((slide) => slide.src.trim() !== "");

    onChange({
      ...normalizedBlock,
      url: coverSlide?.src || "",
      position: coverSlide?.position || normalizedBlock.position || "50% 50%",
      galleryImages: gallerySlides.map((slide) => slide.src),
      galleryPositions: gallerySlides.map((slide) => slide.position),
    } as ContentBlock);
  }, [imageBlock, normalizeImageBlock, onChange]);

  const imageSlides = imageBlock
    ? [
        imageBlock.url
          ? {
              src: imageBlock.url,
              position: imageBlock.position || "50% 50%",
              label: "Capa",
            }
          : null,
        ...(imageBlock.galleryImages || []).map((src, index) => ({
          src,
          position: imageBlock.galleryPositions?.[index] || "50% 50%",
          label: `Slide ${index + 2}`,
        })),
      ].filter((slide): slide is { src: string; position: string; label: string } => Boolean(slide?.src))
    : [];

  const appendImageGallery = useCallback((
    currentBlock: Extract<ContentBlock, { type: "image" }>,
    nextUrls: string[],
  ) => {
    const normalizedBlock = normalizeImageBlock(currentBlock);
    const seen = new Set([normalizedBlock.url, ...normalizedBlock.galleryImages].filter(Boolean));

    nextUrls.forEach((nextUrl) => {
      const trimmedUrl = nextUrl.trim();
      if (!trimmedUrl || seen.has(trimmedUrl)) return;
      seen.add(trimmedUrl);
      normalizedBlock.galleryImages.push(trimmedUrl);
      normalizedBlock.galleryPositions.push("50% 50%");
    });

    return normalizedBlock;
  }, [normalizeImageBlock]);

  const uploadImageAsset = useCallback(async (file: File) => {
    if (!isSupportedVisualUpload(file)) return "";

    const uploaded = await dataProvider.uploadMedia(file, "public");
    addMediaItem(uploaded);
    return uploaded.url;
  }, [addMediaItem]);

  const handleImageUpload = useCallback(async (
    files: FileList | File[],
    mode: "smart" | "replace-cover" | "append-gallery" = "smart",
  ) => {
    if (!imageBlock) return;

    const validFiles = Array.from(files).filter((file) => isSupportedVisualUpload(file));
    if (validFiles.length === 0) return;

    setUploading(true);
    setDragOver(false);

    try {
      const uploadedUrls: string[] = [];

      for (const file of validFiles) {
        try {
          const uploadedUrl = await uploadImageAsset(file);
          if (uploadedUrl) {
            uploadedUrls.push(uploadedUrl);
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : `Nao foi possivel enviar ${file.name}.`);
        }
      }

      if (uploadedUrls.length === 0) return;

      let nextBlock = normalizeImageBlock(imageBlock);

      if (mode === "replace-cover") {
        nextBlock.url = uploadedUrls[0];
        if (uploadedUrls.length > 1) {
          nextBlock = appendImageGallery(nextBlock, uploadedUrls.slice(1));
        }
      } else if (mode === "append-gallery") {
        if (!nextBlock.url) {
          nextBlock.url = uploadedUrls[0];
          nextBlock = appendImageGallery(nextBlock, uploadedUrls.slice(1));
        } else {
          nextBlock = appendImageGallery(nextBlock, uploadedUrls);
        }
      } else if (!nextBlock.url) {
        nextBlock.url = uploadedUrls[0];
        nextBlock = appendImageGallery(nextBlock, uploadedUrls.slice(1));
      } else if (uploadedUrls.length === 1) {
        nextBlock.url = uploadedUrls[0];
      } else {
        nextBlock = appendImageGallery(nextBlock, uploadedUrls);
      }

      onChange(nextBlock as ContentBlock);
    } finally {
      setUploading(false);
    }
  }, [appendImageGallery, imageBlock, normalizeImageBlock, onChange, uploadImageAsset]);

  const removePrimaryImage = useCallback(() => {
    if (!imageBlock) return;

    const nextBlock = normalizeImageBlock(imageBlock);
    const nextCover = nextBlock.galleryImages.shift() || "";
    const nextPosition = nextBlock.galleryPositions.shift();

    onChange({
      ...nextBlock,
      url: nextCover,
      position: nextCover ? nextPosition || nextBlock.position || "50% 50%" : nextBlock.position,
    } as ContentBlock);
  }, [imageBlock, normalizeImageBlock, onChange]);

  const removeGalleryImage = useCallback((galleryIndex: number) => {
    if (!imageBlock) return;

    const nextBlock = normalizeImageBlock(imageBlock);
    nextBlock.galleryImages.splice(galleryIndex, 1);
    nextBlock.galleryPositions.splice(galleryIndex, 1);
    onChange(nextBlock as ContentBlock);
  }, [imageBlock, normalizeImageBlock, onChange]);

  const handleImagePositionChange = useCallback((slideIndex: number, position: string) => {
    if (!imageBlock) return;

    if (slideIndex === 0) {
      onChange({ ...normalizeImageBlock(imageBlock), position } as ContentBlock);
      return;
    }

    const nextBlock = normalizeImageBlock(imageBlock);
    const galleryIndex = slideIndex - 1;
    while (nextBlock.galleryPositions.length <= galleryIndex) {
      nextBlock.galleryPositions.push("50% 50%");
    }
    nextBlock.galleryPositions[galleryIndex] = position;
    onChange(nextBlock as ContentBlock);
  }, [imageBlock, normalizeImageBlock, onChange]);

  const handleSlideMove = useCallback((fromIndex: number, toIndex: number) => {
    if (!imageSlides.length || fromIndex === toIndex) return;
    replaceImageSlides(moveItem(imageSlides, fromIndex, toIndex));
  }, [imageSlides, moveItem, replaceImageSlides]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    if (imageBlock) {
      void handleImageUpload(files, imageBlock.url ? "append-gallery" : "smart");
      return;
    }

    const file = files[0];
    if (file) {
      void handleImageUpload([file]);
    }
  };

  const updateIconGridItem = (iconIndex: number, updates: { name?: string; url?: string; notes?: string }) => {
    if (block.type !== "icon-grid") return;
    const nextIcons = [...block.icons];
    nextIcons[iconIndex] = { ...nextIcons[iconIndex], ...updates };
    onChange({ ...block, icons: nextIcons } as ContentBlock);
  };

  const handleIconUpload = async (file: File, iconIndex: number) => {
    if (!file.type.startsWith("image/") && file.type !== "image/svg+xml") return;

    setIconUploadingIndex(iconIndex);
    try {
      const uploaded = await dataProvider.uploadMedia(file, "public");
      addMediaItem(uploaded);
      updateIconGridItem(iconIndex, {
        url: uploaded.url,
        name: block.type === "icon-grid" && block.icons[iconIndex]?.name
          ? block.icons[iconIndex]?.name
          : file.name.replace(/\.[^.]+$/, ""),
      });
      toast.success("Icone enviado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel carregar o icone.");
    } finally {
      setIconUploadingIndex(null);
      setDragOverIconIndex(null);
      setActiveIconUploadIndex(null);
    }
  };

  const updateCardItem = (cardIndex: number, updates: Partial<ContentCardItem>) => {
    if (block.type !== "cards") return;
    const nextCards = [...block.cards];
    nextCards[cardIndex] = { ...nextCards[cardIndex], ...updates };
    onChange({ ...block, cards: nextCards } as ContentBlock);
  };

  const handleCardImageUpload = async (file: File, cardIndex: number) => {
    if (!isSupportedVisualUpload(file)) {
      toast.error("Use um arquivo de imagem valido.");
      return;
    }

    setUploading(true);
    try {
      const uploadedUrl = await uploadImageAsset(file);
      if (uploadedUrl) {
        updateCardItem(cardIndex, { image: uploadedUrl, imagePosition: "50% 50%" });
        toast.success("Imagem do card enviada.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel carregar a imagem do card.");
    } finally {
      setUploading(false);
      setActiveCardUploadIndex(null);
    }
  };

  const handleVideoUpload = async (file: File, currentBlock: Extract<ContentBlock, { type: "video" }>) => {
    if (!isUploadableVideoFile(file)) {
      toast.error("Use um arquivo de video valido.");
      return;
    }

    setUploading(true);
    setDragOver(false);

    try {
      const uploaded = await dataProvider.uploadMedia(file, "public");
      addMediaItem(uploaded);
      onChange({ ...currentBlock, url: uploaded.url } as ContentBlock);
      toast.success("Video enviado sem compressao.");

      if (file.type && typeof document !== "undefined") {
        const canPlayType = document.createElement("video").canPlayType(file.type);
        if (!canPlayType) {
          toast.info("O video foi enviado em qualidade original, mas MP4 H.264 ou WebM continuam sendo os formatos mais compativeis para todos os navegadores.");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel carregar o video.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      ref={ref}
      className={`group relative rounded-lg border transition-all ${
        isDragging
          ? "opacity-40 border-[#555] scale-[0.98]"
          : isOver && canDrop
          ? "border-[#00ff3c]/50 shadow-[0_0_0_1px_rgba(0,255,60,0.15)]"
          : "border-[#2a2a2a] hover:border-[#444]"
      }`}
      style={{ backgroundColor: "#111" }}
    >
      {/* Drop indicator line */}
      {isOver && canDrop && !isDragging && (
        <div
          className="absolute -top-[2px] left-2 right-2 h-[3px] rounded-full z-10"
          style={{ backgroundColor: "#00ff3c" }}
        />
      )}

      {/* Block toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2a2a2a] bg-[#0e0e0e] rounded-t-lg">
        <div className="flex items-center gap-2">
          <div
            ref={(node) => { drag(node); }}
            className="cursor-grab active:cursor-grabbing text-[#444] hover:text-[#888] transition-colors p-0.5"
            title="Arrastar para reordenar"
          >
            <GripVertical size={12} />
          </div>
          <span className="text-[#666]" style={{ fontSize: "11px" }}>{LABEL_MAP[block.type]}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onMove(-1)} disabled={index === 0} className="text-[#555] hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-default p-0.5">
            <ChevronUp size={12} />
          </button>
          <button onClick={() => onMove(1)} disabled={index === total - 1} className="text-[#555] hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-default p-0.5">
            <ChevronDown size={12} />
          </button>
          <button onClick={onRemove} className="text-[#555] hover:text-red-400 cursor-pointer p-0.5 ml-1">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Block content */}
      <div className="p-3">
        {canShowInSummary(block) && (
          <div className="mb-3">
            <SummaryVisibilityControl
              block={block as Extract<ContentBlock, { showInSummary?: boolean }>}
              onChange={onChange}
            />
          </div>
        )}

        {block.type === "divider" && (
          <div className="space-y-3">
            <div className="px-1" style={{ paddingTop: `${Math.max(16, ((block as Extract<ContentBlock, { type: "divider" }>).spacing ?? 72) / 3)}px`, paddingBottom: `${Math.max(16, ((block as Extract<ContentBlock, { type: "divider" }>).spacing ?? 72) / 3)}px` }}>
              <hr className={(block as Extract<ContentBlock, { type: "divider" }>).variant === "hidden" ? "border-transparent" : "border-[#363636]"} />
            </div>
            <div className="grid grid-cols-2 gap-2 px-1">
              {[
                { value: "default", label: "Padrao" },
                { value: "hidden", label: "Invisivel" },
              ].map((option) => {
                const selected = ((block as Extract<ContentBlock, { type: "divider" }>).variant ?? "default") === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange({ ...block, variant: option.value as "default" | "hidden" } as ContentBlock)}
                    className="rounded-md px-3 py-2 text-left transition-colors"
                    style={{
                      border: `1px solid ${selected ? "#555" : "#252525"}`,
                      backgroundColor: selected ? "#181818" : "#101010",
                      color: selected ? "#fafafa" : "#777",
                      fontSize: "12px",
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 px-1">
              <span className="text-[#666] shrink-0" style={{ fontSize: "11px" }}>Espacamento</span>
              <input
                type="range"
                min={24}
                max={160}
                step={4}
                value={(block as Extract<ContentBlock, { type: "divider" }>).spacing ?? 72}
                onChange={(e) => onChange({ ...block, spacing: parseInt(e.target.value) } as ContentBlock)}
                className="flex-1 h-1 cursor-pointer"
                style={{ accentColor: "#00ff3c" }}
              />
              <span className="text-[#555] w-10 text-right tabular-nums" style={{ fontSize: "11px" }}>
                {(block as Extract<ContentBlock, { type: "divider" }>).spacing ?? 72}px
              </span>
            </div>
            <p className="px-1 text-[#555]" style={{ fontSize: "10px", lineHeight: "14px" }}>
              Use o divisor para controlar o respiro entre secoes.
            </p>
          </div>
        )}

        {(block.type === "paragraph" || block.type === "heading1" || block.type === "heading2" || block.type === "heading3") && (
          <div className="space-y-2">
            <RichTextEditor
              value={(block as any).text}
              onChange={(text) => onChange({ ...block, text } as ContentBlock)}
              compact
              multiline
              editorClassName="w-full rounded px-1.5 py-1 text-[#fafafa]"
              editorStyle={{
                fontSize: fontSizeMap[block.type] || "14px",
                minHeight: block.type === "paragraph" ? "92px" : "48px",
                lineHeight: blockLineHeight ? `${blockLineHeight}px` : undefined,
              }}
              placeholder={block.type === "heading1" ? "Titulo principal..." : block.type === "heading2" ? "Subtitulo..." : block.type === "heading3" ? "Titulo da secao..." : "Escreva seu texto aqui..."}
            />
            {blockLineHeight && (
              <LineHeightControl
                value={blockLineHeight}
                onChange={(value) => onChange({ ...block, lineHeight: clampBlockLineHeight(value) } as ContentBlock)}
              />
            )}
          </div>
        )}

        {(block.type === "unordered-list" || block.type === "ordered-list") && (
          <div className="space-y-2">
            <ListBlockEditor items={(block as any).items} onChange={(items) => onChange({ ...block, items } as ContentBlock)} ordered={block.type === "ordered-list"} lineHeight={blockLineHeight || 22} />
            {blockLineHeight && (
              <LineHeightControl
                value={blockLineHeight}
                onChange={(value) => onChange({ ...block, lineHeight: clampBlockLineHeight(value) } as ContentBlock)}
              />
            )}
          </div>
        )}

        {block.type === "table" && (
          <TableBlockEditor
            block={block}
            onChange={onChange}
          />
        )}

        {block.type === "style-guide" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 min-[980px]:grid-cols-[220px_1fr]">
              <label className="space-y-1">
                <FieldLabel>Titulo</FieldLabel>
                <MiniInput
                  value={block.title}
                  onChange={(title) => onChange({ ...block, title } as ContentBlock)}
                  placeholder="Style guide"
                />
              </label>
              <label className="space-y-1">
                <FieldLabel>Resumo</FieldLabel>
                <MiniTextarea
                  rows={2}
                  value={block.summary}
                  onChange={(summary) => onChange({ ...block, summary } as ContentBlock)}
                  placeholder="Explique a direcao visual, intencao da marca e regras gerais."
                />
              </label>
            </div>
            <div className="space-y-2">
              <FieldLabel>Principios</FieldLabel>
              {block.principles.map((principle, principleIndex) => (
                <div key={principleIndex} className="rounded-lg border p-3" style={{ borderColor: "#2a2a2a", backgroundColor: "#141414" }}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[#888]" style={{ fontSize: "11px" }}>Principio {principleIndex + 1}</span>
                    <button
                      type="button"
                      onClick={() => onChange({ ...block, principles: block.principles.filter((_, index) => index !== principleIndex) } as ContentBlock)}
                      className="text-[#555] hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="grid gap-2 min-[980px]:grid-cols-[220px_1fr]">
                    <MiniInput
                      value={principle.title}
                      onChange={(title) => {
                        const nextPrinciples = [...block.principles];
                        nextPrinciples[principleIndex] = { ...principle, title };
                        onChange({ ...block, principles: nextPrinciples } as ContentBlock);
                      }}
                      placeholder="Nome do principio"
                    />
                    <MiniTextarea
                      rows={2}
                      value={principle.description}
                      onChange={(description) => {
                        const nextPrinciples = [...block.principles];
                        nextPrinciples[principleIndex] = { ...principle, description };
                        onChange({ ...block, principles: nextPrinciples } as ContentBlock);
                      }}
                      placeholder="Como este principio aparece no produto."
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => onChange({ ...block, principles: [...block.principles, { title: "", description: "" }] } as ContentBlock)}
                className="text-[#666] hover:text-[#aaa] flex items-center gap-1 cursor-pointer"
                style={{ fontSize: "12px" }}
              >
                <Plus size={12} /> Adicionar principio
              </button>
            </div>
            <ShowcaseBlockView block={block} variant="preview" />
          </div>
        )}

        {block.type === "color-palette" && (
          <div className="space-y-3">
            <label className="space-y-1">
              <FieldLabel>Titulo</FieldLabel>
              <MiniInput
                value={block.title}
                onChange={(title) => onChange({ ...block, title } as ContentBlock)}
                placeholder="Paleta de cores"
              />
            </label>
            <div className="space-y-2">
              <FieldLabel>Cores</FieldLabel>
              {block.colors.map((color, colorIndex) => (
                <div key={colorIndex} className="rounded-lg border p-3" style={{ borderColor: "#2a2a2a", backgroundColor: "#141414" }}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[#888]" style={{ fontSize: "11px" }}>Cor {colorIndex + 1}</span>
                    <button
                      type="button"
                      onClick={() => onChange({ ...block, colors: block.colors.filter((_, index) => index !== colorIndex) } as ContentBlock)}
                      className="text-[#555] hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="grid gap-2 min-[920px]:grid-cols-2 xl:grid-cols-[150px_190px_150px_1fr]">
                    <MiniInput
                      value={color.name}
                      onChange={(name) => {
                        const nextColors = [...block.colors];
                        nextColors[colorIndex] = { ...color, name };
                        onChange({ ...block, colors: nextColors } as ContentBlock);
                      }}
                      placeholder="Nome"
                    />
                    <MiniInput
                      value={color.token || ""}
                      onChange={(token) => {
                        const nextColors = [...block.colors];
                        nextColors[colorIndex] = { ...color, token };
                        onChange({ ...block, colors: nextColors } as ContentBlock);
                      }}
                      placeholder="Token, ex. color.primary"
                    />
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={color.hex || "#000000"}
                        onChange={(event) => {
                          const nextColors = [...block.colors];
                          nextColors[colorIndex] = { ...color, hex: event.target.value };
                          onChange({ ...block, colors: nextColors } as ContentBlock);
                        }}
                        className="h-[36px] w-[52px] rounded border bg-transparent p-1"
                        style={{ borderColor: "#2a2a2a" }}
                      />
                      <MiniInput
                        value={color.hex}
                        onChange={(hex) => {
                          const nextColors = [...block.colors];
                          nextColors[colorIndex] = { ...color, hex };
                          onChange({ ...block, colors: nextColors } as ContentBlock);
                        }}
                        placeholder="#111827"
                      />
                    </div>
                    <MiniInput
                      value={color.role}
                      onChange={(role) => {
                        const nextColors = [...block.colors];
                        nextColors[colorIndex] = { ...color, role };
                        onChange({ ...block, colors: nextColors } as ContentBlock);
                      }}
                      placeholder="Primaria, accent, background..."
                    />
                  </div>
                  <div className="mt-2">
                    <MiniTextarea
                      rows={2}
                      value={color.usage}
                      onChange={(usage) => {
                        const nextColors = [...block.colors];
                        nextColors[colorIndex] = { ...color, usage };
                        onChange({ ...block, colors: nextColors } as ContentBlock);
                      }}
                      placeholder="Onde e como essa cor e usada."
                    />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => onChange({ ...block, colors: [...block.colors, { name: "", token: "", hex: "#000000", role: "", usage: "" }] } as ContentBlock)} className="text-[#666] hover:text-[#aaa] flex items-center gap-1 cursor-pointer" style={{ fontSize: "12px" }}>
                <Plus size={12} /> Adicionar cor
              </button>
            </div>
            <ShowcaseBlockView block={block} variant="preview" />
          </div>
        )}

        {block.type === "typography" && (
          <div className="space-y-3">
            <label className="space-y-1">
              <FieldLabel>Titulo</FieldLabel>
              <MiniInput
                value={block.title}
                onChange={(title) => onChange({ ...block, title } as ContentBlock)}
                placeholder="Tipografia"
              />
            </label>
            <div className="space-y-2">
              <FieldLabel>Estilos tipograficos</FieldLabel>
              {block.fonts.map((font, fontIndex) => (
                <div key={fontIndex} className="rounded-lg border p-3" style={{ borderColor: "#2a2a2a", backgroundColor: "#141414" }}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[#888]" style={{ fontSize: "11px" }}>Fonte {fontIndex + 1}</span>
                    <button type="button" onClick={() => onChange({ ...block, fonts: block.fonts.filter((_, index) => index !== fontIndex) } as ContentBlock)} className="text-[#555] hover:text-red-400 cursor-pointer">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="grid gap-2 min-[980px]:grid-cols-3">
                    <MiniInput value={font.label} onChange={(label) => {
                      const nextFonts = [...block.fonts];
                      nextFonts[fontIndex] = { ...font, label };
                      onChange({ ...block, fonts: nextFonts } as ContentBlock);
                    }} placeholder="Heading, Body, Caption..." />
                    <MiniInput value={font.token || ""} onChange={(token) => {
                      const nextFonts = [...block.fonts];
                      nextFonts[fontIndex] = { ...font, token };
                      onChange({ ...block, fonts: nextFonts } as ContentBlock);
                    }} placeholder="Token, ex. font.heading.lg" />
                    <MiniInput value={font.family} onChange={(family) => {
                      const nextFonts = [...block.fonts];
                      nextFonts[fontIndex] = { ...font, family };
                      onChange({ ...block, fonts: nextFonts } as ContentBlock);
                    }} placeholder="Inter, General Sans, Sora..." />
                  </div>
                  <div className="mt-2 grid gap-2 min-[980px]:grid-cols-3">
                    <MiniInput value={font.weight} onChange={(weight) => {
                      const nextFonts = [...block.fonts];
                      nextFonts[fontIndex] = { ...font, weight };
                      onChange({ ...block, fonts: nextFonts } as ContentBlock);
                    }} placeholder="400, 500, 700..." />
                    <MiniInput value={font.size} onChange={(size) => {
                      const nextFonts = [...block.fonts];
                      nextFonts[fontIndex] = { ...font, size };
                      onChange({ ...block, fonts: nextFonts } as ContentBlock);
                    }} placeholder="16px, 2rem..." />
                    <MiniInput value={font.lineHeight} onChange={(lineHeight) => {
                      const nextFonts = [...block.fonts];
                      nextFonts[fontIndex] = { ...font, lineHeight };
                      onChange({ ...block, fonts: nextFonts } as ContentBlock);
                    }} placeholder="1.4, 24px..." />
                  </div>
                  <div className="mt-2">
                    <MiniTextarea value={font.sample} onChange={(sample) => {
                      const nextFonts = [...block.fonts];
                      nextFonts[fontIndex] = { ...font, sample };
                      onChange({ ...block, fonts: nextFonts } as ContentBlock);
                    }} rows={2} placeholder="Texto de exemplo para mostrar este estilo." />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => onChange({ ...block, fonts: [...block.fonts, { label: "", token: "", family: "", weight: "", size: "", lineHeight: "", sample: "" }] } as ContentBlock)} className="text-[#666] hover:text-[#aaa] flex items-center gap-1 cursor-pointer" style={{ fontSize: "12px" }}>
                <Plus size={12} /> Adicionar estilo tipografico
              </button>
            </div>
            <ShowcaseBlockView block={block} variant="preview" />
          </div>
        )}

        {block.type === "icon-grid" && (
          <div className="space-y-3">
            <label className="space-y-1">
              <FieldLabel>Titulo</FieldLabel>
              <MiniInput
                value={block.title}
                onChange={(title) => onChange({ ...block, title } as ContentBlock)}
                placeholder="Iconografia"
              />
            </label>
            <div className="space-y-2">
              <FieldLabel>Icones</FieldLabel>
              {block.icons.map((icon, iconIndex) => (
                <div key={iconIndex} className="rounded-lg border p-3" style={{ borderColor: "#2a2a2a", backgroundColor: "#141414" }}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[#888]" style={{ fontSize: "11px" }}>Icone {iconIndex + 1}</span>
                    <button type="button" onClick={() => onChange({ ...block, icons: block.icons.filter((_, index) => index !== iconIndex) } as ContentBlock)} className="text-[#555] hover:text-red-400 cursor-pointer">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="grid gap-3 min-[980px]:grid-cols-[112px_1fr]">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveIconUploadIndex(iconIndex);
                        iconFileInputRef.current?.click();
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragOverIconIndex(iconIndex);
                      }}
                      onDragLeave={() => {
                        if (dragOverIconIndex === iconIndex) setDragOverIconIndex(null);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        setDragOverIconIndex(null);
                        const file = event.dataTransfer.files?.[0];
                        if (file) void handleIconUpload(file, iconIndex);
                      }}
                      className="relative flex h-[112px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border transition-colors"
                      style={{
                        borderColor: dragOverIconIndex === iconIndex ? "#38bdf8" : "#2a2a2a",
                        borderStyle: "dashed",
                        backgroundColor: dragOverIconIndex === iconIndex ? "#0f1c2f" : "#111111",
                      }}
                    >
                      {icon.url ? (
                        <>
                          <img src={icon.url} alt={icon.name || `Icone ${iconIndex + 1}`} className="max-h-14 max-w-14 object-contain" />
                          <span className="mt-2 text-[#666]" style={{ fontSize: "10px", lineHeight: "14px" }}>
                            {iconUploadingIndex === iconIndex ? "Enviando..." : dragOverIconIndex === iconIndex ? "Solte para trocar" : "Clique ou arraste"}
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload size={18} className="text-[#555]" />
                          <span className="mt-2 text-[#777]" style={{ fontSize: "11px", lineHeight: "16px" }}>
                            {iconUploadingIndex === iconIndex ? "Enviando..." : dragOverIconIndex === iconIndex ? "Solte o icone" : "Upload do icone"}
                          </span>
                          <span className="text-[#555]" style={{ fontSize: "10px", lineHeight: "14px" }}>
                            SVG, PNG, WebP
                          </span>
                        </>
                      )}
                    </button>
                    <div className="space-y-2">
                      <MiniInput value={icon.name} onChange={(name) => {
                        const nextIcons = [...block.icons];
                        nextIcons[iconIndex] = { ...icon, name };
                        onChange({ ...block, icons: nextIcons } as ContentBlock);
                      }} placeholder="Nome do icone" />
                      <MiniInput value={icon.token || ""} onChange={(token) => {
                        const nextIcons = [...block.icons];
                        nextIcons[iconIndex] = { ...icon, token };
                        onChange({ ...block, icons: nextIcons } as ContentBlock);
                      }} placeholder="Token, ex. icon.navigation.default" />
                      <MiniInput value={icon.url} onChange={(url) => {
                        const nextIcons = [...block.icons];
                        nextIcons[iconIndex] = { ...icon, url };
                        onChange({ ...block, icons: nextIcons } as ContentBlock);
                      }} placeholder="URL do SVG/PNG" />
                      {icon.url && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveIconUploadIndex(iconIndex);
                              iconFileInputRef.current?.click();
                            }}
                            className="inline-flex h-[32px] items-center gap-1.5 rounded-md px-2.5 text-[#ddd] transition-colors hover:bg-[#1a1a1a]"
                            style={{ fontSize: "11px", border: "1px solid #2a2a2a" }}
                          >
                            <Upload size={11} />
                            Trocar
                          </button>
                          <button
                            type="button"
                            onClick={() => updateIconGridItem(iconIndex, { url: "" })}
                            className="inline-flex h-[32px] items-center gap-1.5 rounded-md px-2.5 text-[#888] transition-colors hover:text-red-400"
                            style={{ fontSize: "11px", border: "1px solid #2a2a2a" }}
                          >
                            <X size={11} />
                            Limpar arquivo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <MiniTextarea value={icon.notes} onChange={(notes) => {
                      const nextIcons = [...block.icons];
                      nextIcons[iconIndex] = { ...icon, notes };
                      onChange({ ...block, icons: nextIcons } as ContentBlock);
                    }} rows={2} placeholder="Observacao, estado de uso, familia, etc." />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => onChange({ ...block, icons: [...block.icons, { name: "", token: "", url: "", notes: "" }] } as ContentBlock)} className="text-[#666] hover:text-[#aaa] flex items-center gap-1 cursor-pointer" style={{ fontSize: "12px" }}>
                <Plus size={12} /> Adicionar icone
              </button>
            </div>
            <input
              ref={iconFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file && activeIconUploadIndex !== null) void handleIconUpload(file, activeIconUploadIndex);
                event.currentTarget.value = "";
              }}
            />
            <ShowcaseBlockView block={block} variant="preview" />
          </div>
        )}

        {block.type === "user-flow" && (
          <div className="space-y-3">
            <label className="space-y-1">
              <FieldLabel>Titulo</FieldLabel>
              <MiniInput
                value={block.title}
                onChange={(title) => onChange({ ...block, title } as ContentBlock)}
                placeholder="Fluxo do usuario"
              />
            </label>
            <div className="space-y-2">
              <FieldLabel>Etapas</FieldLabel>
              {block.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="rounded-lg border p-3" style={{ borderColor: "#2a2a2a", backgroundColor: "#141414" }}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[#888]" style={{ fontSize: "11px" }}>Etapa {stepIndex + 1}</span>
                    <button type="button" onClick={() => onChange({ ...block, steps: block.steps.filter((_, index) => index !== stepIndex) } as ContentBlock)} className="text-[#555] hover:text-red-400 cursor-pointer">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="grid gap-2 min-[980px]:grid-cols-[220px_1fr]">
                    <MiniInput value={step.title} onChange={(title) => {
                      const nextSteps = [...block.steps];
                      nextSteps[stepIndex] = { ...step, title };
                      onChange({ ...block, steps: nextSteps } as ContentBlock);
                    }} placeholder="Nome da etapa" />
                    <MiniInput value={step.outcome} onChange={(outcome) => {
                      const nextSteps = [...block.steps];
                      nextSteps[stepIndex] = { ...step, outcome };
                      onChange({ ...block, steps: nextSteps } as ContentBlock);
                    }} placeholder="Resultado esperado" />
                  </div>
                  <div className="mt-2">
                    <MiniTextarea value={step.description} onChange={(description) => {
                      const nextSteps = [...block.steps];
                      nextSteps[stepIndex] = { ...step, description };
                      onChange({ ...block, steps: nextSteps } as ContentBlock);
                    }} rows={2} placeholder="Explique o que acontece nesta etapa do fluxo." />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => onChange({ ...block, steps: [...block.steps, { title: "", description: "", outcome: "" }] } as ContentBlock)} className="text-[#666] hover:text-[#aaa] flex items-center gap-1 cursor-pointer" style={{ fontSize: "12px" }}>
                <Plus size={12} /> Adicionar etapa
              </button>
            </div>
            <ShowcaseBlockView block={block} variant="preview" />
          </div>
        )}

        {block.type === "sitemap" && (
          <div className="space-y-3">
            <label className="space-y-1">
              <FieldLabel>Titulo</FieldLabel>
              <MiniInput
                value={block.title}
                onChange={(title) => onChange({ ...block, title } as ContentBlock)}
                placeholder="Sitemap"
              />
            </label>
            <div className="space-y-2">
              <FieldLabel>Secoes</FieldLabel>
              {block.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="rounded-lg border p-3" style={{ borderColor: "#2a2a2a", backgroundColor: "#141414" }}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[#888]" style={{ fontSize: "11px" }}>Secao {sectionIndex + 1}</span>
                    <button type="button" onClick={() => onChange({ ...block, sections: block.sections.filter((_, index) => index !== sectionIndex) } as ContentBlock)} className="text-[#555] hover:text-red-400 cursor-pointer">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="grid gap-2 min-[980px]:grid-cols-[220px_1fr]">
                    <MiniInput value={section.title} onChange={(title) => {
                      const nextSections = [...block.sections];
                      nextSections[sectionIndex] = { ...section, title };
                      onChange({ ...block, sections: nextSections } as ContentBlock);
                    }} placeholder="Nome da secao" />
                    <MiniTextarea value={section.description} onChange={(description) => {
                      const nextSections = [...block.sections];
                      nextSections[sectionIndex] = { ...section, description };
                      onChange({ ...block, sections: nextSections } as ContentBlock);
                    }} rows={2} placeholder="Contexto da secao no sitemap." />
                  </div>
                  <div className="mt-2">
                    <MiniTextarea
                      rows={4}
                      value={section.children.join("\n")}
                      onChange={(value) => {
                        const nextSections = [...block.sections];
                        nextSections[sectionIndex] = {
                          ...section,
                          children: value
                            .split("\n")
                            .map((entry) => entry.trim())
                            .filter(Boolean),
                        };
                        onChange({ ...block, sections: nextSections } as ContentBlock);
                      }}
                      placeholder={"Uma pagina por linha\nHome\nPricing\nDashboard"}
                    />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => onChange({ ...block, sections: [...block.sections, { title: "", description: "", children: [] }] } as ContentBlock)} className="text-[#666] hover:text-[#aaa] flex items-center gap-1 cursor-pointer" style={{ fontSize: "12px" }}>
                <Plus size={12} /> Adicionar secao
              </button>
            </div>
            <ShowcaseBlockView block={block} variant="preview" />
          </div>
        )}

        {block.type === "code" && (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2 min-[980px]:grid-cols-[180px_1fr]">
              <label className="space-y-1">
                <span className="block text-[#666]" style={{ fontSize: "11px", lineHeight: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Linguagem
                </span>
                <select
                  value={block.language}
                  onChange={(event) => onChange({ ...block, language: event.target.value } as ContentBlock)}
                  className="h-[36px] w-full rounded border px-2.5 text-[#fafafa] focus:outline-none"
                  style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", fontSize: "13px" }}
                >
                  {CODE_LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="block text-[#666]" style={{ fontSize: "11px", lineHeight: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Legenda
                </span>
                <SelectionProtectedInput
                  value={block.caption || ""}
                  onChange={(event) => onChange({ ...block, caption: event.target.value } as ContentBlock)}
                  className="h-[36px] w-full rounded border px-2.5 text-[#fafafa] focus:outline-none"
                  style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", fontSize: "13px" }}
                  placeholder="Legenda opcional..."
                />
              </label>
            </div>
            <SelectionProtectedTextarea
              value={block.code}
              onChange={(event) => onChange({ ...block, code: event.target.value } as ContentBlock)}
              className="w-full rounded-lg border px-3 py-3 text-[#e5e5e5] focus:outline-none"
              style={{
                minHeight: "220px",
                backgroundColor: "#0d0d0d",
                borderColor: "#2a2a2a",
                fontSize: "13px",
                lineHeight: "21px",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
              }}
              placeholder="// Cole ou escreva seu codigo aqui"
              spellCheck={false}
            />
          </div>
        )}

        {block.type === "image" && (() => {
          const galleryImages = (block.galleryImages || []).filter(Boolean);
          const hasSlider = galleryImages.length > 0;

          return (
            <div className="space-y-3">
              {!block.url ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 px-4 cursor-pointer transition-colors ${dragOver ? "border-[#555] bg-[#1f1f1f]" : "border-[#2a2a2a] bg-[#141414] hover:border-[#444] hover:bg-[#1a1a1a]"}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,application/json,.json,.lottie"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      const files = event.target.files;
                      if (files && files.length > 0) {
                        void handleImageUpload(files, "smart");
                      }
                      event.currentTarget.value = "";
                    }}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#555] border-t-white rounded-full animate-spin" />
                      <span className="text-[#888]" style={{ fontSize: "13px" }}>Carregando...</span>
                    </div>
                    ) : (
                      <>
                        <Upload size={20} className="text-[#555]" />
                        <span className="text-[#888]" style={{ fontSize: "13px" }}>Clique ou arraste uma ou varias midias visuais aqui</span>
                        <span className="text-[#555]" style={{ fontSize: "11px" }}>WebM, Lottie JSON, SVG, WebP e imagens. A primeira vira capa e as demais entram no slider do bloco</span>
                      </>
                    )}
                  </div>
              ) : (
                <div className="space-y-3">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`overflow-hidden rounded-xl border transition-colors ${dragOver ? "border-[#555] bg-[#151515]" : "border-[#2a2a2a] bg-[#141414]"}`}
                  >
                    <div className="border-b border-[#1f1f1f] px-3 py-2">
                      <span className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {hasSlider ? `Slider ativo com ${galleryImages.length + 1} assets` : "Asset unico"}
                      </span>
                    </div>
                    <div className="p-3">
                      <PreviewMediaSlider
                        title={block.caption || "Imagem do bloco"}
                        image={block.url}
                        imagePosition={block.position || "50% 50%"}
                        galleryImages={galleryImages}
                        galleryPositions={block.galleryPositions || []}
                        aspectRatio="16 / 10"
                        frameClassName="rounded-lg"
                        frameStyle={{ borderRadius: `${block.borderRadius || 0}px` }}
                        disablePointerEvents={false}
                        emptyLabel="Midia"
                        imageClassName="cursor-pointer"
                        onImageClick={(payload) => {
                          if (!payload.slides[payload.index || 0]?.src) return;
                          setImageLightbox(payload);
                        }}
                      />
                    </div>
                    {dragOver && (
                      <div className="border-t border-[#1f1f1f] px-3 py-2 text-center text-[#9a9a9a]" style={{ fontSize: "11px" }}>
                        Solte aqui para adicionar os assets ao slider sem trocar a capa
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-md bg-[#1a1a1a] px-3 py-2 text-[#fafafa] transition-colors hover:bg-[#222] cursor-pointer flex items-center gap-1.5"
                      style={{ fontSize: "12px" }}
                    >
                      <Upload size={12} /> Trocar capa
                    </button>
                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="rounded-md bg-[#1a1a1a] px-3 py-2 text-[#fafafa] transition-colors hover:bg-[#222] cursor-pointer flex items-center gap-1.5"
                      style={{ fontSize: "12px" }}
                    >
                      <Plus size={12} /> Adicionar ao slider
                    </button>
                    <button
                      type="button"
                      onClick={removePrimaryImage}
                      className="rounded-md bg-[#1a1a1a] px-3 py-2 text-white transition-colors hover:bg-red-500/80 cursor-pointer flex items-center gap-1.5"
                      style={{ fontSize: "12px" }}
                    >
                      <X size={12} /> Remover asset
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,application/json,.json,.lottie"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      const files = event.target.files;
                      if (files && files.length > 0) {
                        void handleImageUpload(files, "replace-cover");
                      }
                      event.currentTarget.value = "";
                    }}
                  />
                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    accept="image/*,video/*,application/json,.json,.lottie"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      const files = event.target.files;
                      if (files && files.length > 0) {
                        void handleImageUpload(files, "append-gallery");
                      }
                      event.currentTarget.value = "";
                    }}
                  />

                  {imageSlides.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {hasSlider ? "Assets do slider" : "Asset atual"}
                        </span>
                        <span className="text-[#555]" style={{ fontSize: "11px" }}>
                          {hasSlider ? "A capa fica na visualizacao principal" : "Mesmo conjunto de acoes do slider"}
                        </span>
                      </div>
                      <p className="text-[#444]" style={{ fontSize: "10px", lineHeight: "15px" }}>
                        {hasSlider
                          ? "Imagens continuam com reposicionamento. WebM e Lottie usam enquadramento automatico para preservar fluidez."
                          : "Imagem unica tambem pode ser reposicionada, aberta inteira e centralizada sem precisar adicionar novos slides."}
                      </p>
                      <div className="grid grid-cols-2 gap-2 min-[980px]:grid-cols-3">
                        {imageSlides.map((slide, slideIndex) => (
                          <div key={`${slide.src}-${slideIndex}`} className="space-y-1">
                            <div className="flex items-center justify-between gap-2 px-1">
                              <span className="text-[#777]" style={{ fontSize: "11px" }}>
                                {slide.label}
                              </span>
                              <span className="text-[#555]" style={{ fontSize: "10px" }}>
                                {slideIndex === 0 ? (hasSlider ? "Slide principal" : "Asset unico") : "Arraste para ordenar"}
                              </span>
                            </div>
                            {supportsPositionEditor(slide.src) ? (
                              <ImagePositionEditorCompact
                                src={slide.src}
                                alt={`${block.caption || "Imagem"} ${slide.label}`}
                                position={slide.position}
                                onChange={(position) => handleImagePositionChange(slideIndex, position)}
                                onRemove={() => (slideIndex === 0 ? removePrimaryImage() : removeGalleryImage(slideIndex - 1))}
                                height={160}
                                canMoveBackward={slideIndex > 0}
                                canMoveForward={slideIndex < imageSlides.length - 1}
                                onMoveBackward={() => handleSlideMove(slideIndex, slideIndex - 1)}
                                onMoveForward={() => handleSlideMove(slideIndex, slideIndex + 1)}
                              />
                            ) : (
                              <div
                                className="overflow-hidden rounded-[12px] border"
                                style={{ borderColor: "#2a2a2a", backgroundColor: "#101010" }}
                              >
                                <div style={{ height: "160px" }}>
                                  <ContentImage
                                    src={slide.src}
                                    alt={`${block.caption || "Imagem"} ${slide.label}`}
                                    className="h-full w-full object-cover"
                                    style={{ backgroundColor: "#0f0f0f" }}
                                  />
                                </div>
                                <div
                                  className="flex items-center justify-between gap-2 border-t px-2 py-2"
                                  style={{ borderColor: "#1e1e1e" }}
                                >
                                  <span className="text-[#555]" style={{ fontSize: "10px", lineHeight: "15px" }}>
                                    Enquadramento automatico
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSlideMove(slideIndex, slideIndex - 1)}
                                      disabled={slideIndex === 0}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-[#777] transition-colors hover:bg-[#1a1a1a] hover:text-[#fafafa] disabled:opacity-30"
                                    >
                                      <ChevronUp size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSlideMove(slideIndex, slideIndex + 1)}
                                      disabled={slideIndex === imageSlides.length - 1}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-[#777] transition-colors hover:bg-[#1a1a1a] hover:text-[#fafafa] disabled:opacity-30"
                                    >
                                      <ChevronDown size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => (slideIndex === 0 ? removePrimaryImage() : removeGalleryImage(slideIndex - 1))}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-[#777] transition-colors hover:bg-[#1a1a1a] hover:text-red-400"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}
        {block.type === "image" && (
          <ImageLightbox
            open={Boolean(imageLightbox)}
            src={imageLightbox?.slides[imageLightbox?.index || 0]?.src || ""}
            alt={imageLightbox?.slides[imageLightbox?.index || 0]?.alt || ""}
            originRect={imageLightbox?.slides[imageLightbox?.index || 0]?.originRect}
            slides={imageLightbox?.slides}
            initialIndex={imageLightbox?.index || 0}
            onClose={() => setImageLightbox(null)}
          />
        )}
        {block.type === "image" && (
          <>
            <RichTextEditor
              value={block.caption}
              onChange={(caption) => onChange({ ...block, caption } as ContentBlock)}
              multiline={false}
              compact
              placeholder="Legenda (opcional)..."
              editorClassName="w-full rounded px-2.5 py-1.5 text-[#aaa]"
              editorStyle={{ fontSize: "12px", backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", minHeight: "34px" }}
              placeholderClassName="px-2.5 py-1.5"
            />
            <div className="flex items-center gap-2 px-1">
              <span className="text-[#666] shrink-0" style={{ fontSize: "11px" }}>Arredondamento</span>
              <input
                type="range"
                min={0}
                max={32}
                step={1}
                value={block.borderRadius || 0}
                onChange={(event) => onChange({ ...block, borderRadius: parseInt(event.target.value) } as ContentBlock)}
                className="flex-1 h-1 cursor-pointer"
                style={{ accentColor: "#00ff3c" }}
              />
              <span className="text-[#555] w-8 text-right tabular-nums" style={{ fontSize: "11px" }}>{block.borderRadius || 0}px</span>
            </div>
          </>
        )}

        {block.type === "video" && (() => {
          const vBlock = block as { type: "video"; url: string; caption: string; poster?: string; autoplay?: boolean; loop?: boolean; muted?: boolean; previewStart?: number; previewDuration?: number; fit?: "contain" | "cover"; zoom?: number };
          const muxPlaybackId = extractMuxPlaybackId(vBlock.url);
          const applyVideoUrl = (url: string) => {
            const trimmedUrl = normalizeVideoInput(url);
            if (!trimmedUrl) return;
            onChange({ ...vBlock, url: trimmedUrl } as ContentBlock);
          };
          return (
            <div className="space-y-3">
              {!vBlock.url ? (
                <>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) void handleVideoUpload(f, vBlock as Extract<ContentBlock, { type: "video" }>); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 px-4 cursor-pointer transition-colors ${dragOver ? "border-[#555] bg-[#1f1f1f]" : "border-[#2a2a2a] bg-[#141414] hover:border-[#444] hover:bg-[#1a1a1a]"}`}
                  >
                    <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleVideoUpload(f, vBlock as Extract<ContentBlock, { type: "video" }>); e.currentTarget.value = ""; }} />
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#555] border-t-white" />
                        <span className="text-[#888]" style={{ fontSize: "13px" }}>Enviando video original...</span>
                        <span className="text-[#555]" style={{ fontSize: "11px" }}>Sem compressao automatica</span>
                      </div>
                    ) : (
                      <>
                        <Video size={24} className="text-[#555]" />
                        <span className="text-[#888]" style={{ fontSize: "13px" }}>Arraste um video ou clique para enviar</span>
                        <span className="text-[#555]" style={{ fontSize: "11px" }}>Ou cole um Playback ID do Mux para manter seu player atual com stream HLS e thumbnail automatica</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#555] shrink-0" style={{ fontSize: "11px" }}>ou</span>
                    <SelectionProtectedInput
                      defaultValue=""
                      onBlur={(e) => applyVideoUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          applyVideoUrl(e.currentTarget.value);
                        }
                      }}
                      className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-[#fafafa] focus:outline-none focus:border-[#555]"
                      style={{ fontSize: "12px" }}
                      placeholder="Cole a URL do video ou o Playback ID do Mux"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div
                    className="relative group/vid"
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) void handleVideoUpload(f, vBlock as Extract<ContentBlock, { type: "video" }>);
                    }}
                  >
                    <VideoPlayer
                      src={vBlock.url}
                      poster={vBlock.poster || undefined}
                      autoPlay={vBlock.autoplay || false}
                      loop={vBlock.loop || false}
                      muted={vBlock.muted || vBlock.autoplay || false}
                      height={300}
                      borderRadius={(block as any).borderRadius || 0}
                      fit={vBlock.fit || "contain"}
                      zoom={vBlock.zoom ?? 1}
                    />
                    <div
                      className="pointer-events-none absolute inset-0 rounded-lg transition-colors"
                    />
                    <div className={`absolute top-2 right-2 flex gap-1.5 transition-opacity ${dragOver ? "opacity-100" : "opacity-0 group-hover/vid:opacity-100"}`}>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#222]/80 hover:bg-[#333] text-white rounded-md px-3 py-1.5 cursor-pointer flex items-center gap-1.5 backdrop-blur-sm"
                        style={{ fontSize: "12px" }}
                      >
                        <Upload size={12} /> Trocar
                      </button>
                      <button
                        onClick={() => onChange({ ...vBlock, url: "" } as ContentBlock)}
                        className="bg-[#222]/80 hover:bg-red-500/80 text-white rounded-md px-3 py-1.5 cursor-pointer flex items-center gap-1.5 backdrop-blur-sm"
                        style={{ fontSize: "12px" }}
                      >
                        <X size={12} /> Remover
                      </button>
                    </div>
                    {dragOver && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/45">
                        <span className="rounded-full bg-black/70 px-3 py-1 text-white backdrop-blur-sm" style={{ fontSize: "11px" }}>
                          Solte o video para substituir
                        </span>
                      </div>
                    )}
                    {uploading && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/55">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                          <span className="rounded-full bg-black/60 px-3 py-1 text-white backdrop-blur-sm" style={{ fontSize: "11px" }}>
                            Atualizando video original...
                          </span>
                        </div>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleVideoUpload(f, vBlock as Extract<ContentBlock, { type: "video" }>); e.currentTarget.value = ""; }} />
                  </div>
                  {muxPlaybackId && (
                    <div className="flex items-center gap-2 rounded-md border border-[#2a2a2a] bg-[#141414] px-3 py-2">
                      <span className="rounded-full border border-[#2f6f46] bg-[#112719] px-2 py-0.5 text-[#8ce0aa]" style={{ fontSize: "10px", lineHeight: "14px" }}>
                        Mux HLS
                      </span>
                      <span className="text-[#777]" style={{ fontSize: "11px" }}>
                        Playback ID: {muxPlaybackId}
                      </span>
                    </div>
                  )}
                  <SelectionProtectedInput
                    value={vBlock.url}
                    onChange={(e) => onChange({ ...vBlock, url: e.target.value } as ContentBlock)}
                    onBlur={(e) => applyVideoUrl(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-[#aaa] focus:outline-none focus:border-[#555]"
                    style={{ fontSize: "11px" }}
                    placeholder="URL do video ou Playback ID do Mux"
                  />
                </div>
              )}
              {/* Video settings */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={vBlock.autoplay || false} onChange={(e) => onChange({ ...vBlock, autoplay: e.target.checked } as ContentBlock)} className="accent-[#00ff3c] w-3.5 h-3.5" />
                  <span className="text-[#888]" style={{ fontSize: "11px" }}>Autoplay</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={vBlock.loop || false} onChange={(e) => onChange({ ...vBlock, loop: e.target.checked } as ContentBlock)} className="accent-[#00ff3c] w-3.5 h-3.5" />
                  <span className="text-[#888]" style={{ fontSize: "11px" }}>Loop</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={vBlock.muted || false} onChange={(e) => onChange({ ...vBlock, muted: e.target.checked } as ContentBlock)} className="accent-[#00ff3c] w-3.5 h-3.5" />
                  <span className="text-[#888]" style={{ fontSize: "11px" }}>Mudo</span>
                </label>
              </div>
              <div className="grid gap-2 min-[980px]:grid-cols-2">
                <label className="space-y-1">
                  <FieldLabel>Enquadramento</FieldLabel>
                  <select
                    value={vBlock.fit || "contain"}
                    onChange={(e) => onChange({ ...vBlock, fit: e.target.value as "contain" | "cover" } as ContentBlock)}
                    className="w-full rounded border border-[#2a2a2a] bg-[#1a1a1a] px-2.5 py-1.5 text-[#fafafa] focus:outline-none focus:border-[#555]"
                    style={{ fontSize: "12px" }}
                  >
                    <option value="contain">Conteudo inteiro</option>
                    <option value="cover">Preencher quadro</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <FieldLabel>Zoom visual</FieldLabel>
                  <div className="flex items-center gap-2 rounded border border-[#2a2a2a] bg-[#1a1a1a] px-2.5 py-2">
                    <input
                      type="range"
                      min={1}
                      max={1.6}
                      step={0.02}
                      value={vBlock.zoom ?? 1}
                      onChange={(e) => onChange({ ...vBlock, zoom: Number(e.target.value) } as ContentBlock)}
                      className="flex-1 h-1 cursor-pointer"
                      style={{ accentColor: "#00ff3c" }}
                    />
                    <span className="w-12 text-right tabular-nums text-[#888]" style={{ fontSize: "11px" }}>
                      {`${Math.round((vBlock.zoom ?? 1) * 100)}%`}
                    </span>
                  </div>
                </label>
              </div>
              <SelectionProtectedInput
                value={vBlock.poster || ""}
                onChange={(e) => onChange({ ...vBlock, poster: e.target.value } as ContentBlock)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-[#aaa] focus:outline-none focus:border-[#555]"
                style={{ fontSize: "12px" }}
                placeholder={muxPlaybackId ? "Poster manual (opcional, o Mux ja gera thumbnail automaticamente)" : "URL do poster/thumbnail (opcional)"}
              />
              <SelectionProtectedInput
                value={vBlock.caption}
                onChange={(e) => onChange({ ...vBlock, caption: e.target.value } as ContentBlock)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-[#aaa] focus:outline-none focus:border-[#555]"
                style={{ fontSize: "12px" }}
                placeholder="Legenda (opcional)..."
              />
              <p className="text-[#444] px-1" style={{ fontSize: "10px" }}>
                Use "Preencher quadro" para ocupar todo o frame e ajuste o zoom sem alterar o arquivo original do video. Se voce colar um Playback ID do Mux, o CMS monta o stream HLS e a thumbnail automaticamente.
              </p>
              {/* Border radius control */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-[#666] shrink-0" style={{ fontSize: "11px" }}>Arredondamento</span>
                <input
                  type="range"
                  min={0}
                  max={32}
                  step={1}
                  value={(block as any).borderRadius || 0}
                  onChange={(e) => onChange({ ...block, borderRadius: parseInt(e.target.value) } as ContentBlock)}
                  className="flex-1 h-1 cursor-pointer"
                  style={{ accentColor: "#00ff3c" }}
                />
                <span className="text-[#555] w-8 text-right tabular-nums" style={{ fontSize: "11px" }}>{(block as any).borderRadius || 0}px</span>
              </div>
            </div>
          );
        })()}

        {block.type === "quote" && (
          <div className="space-y-2">
            <RichTextEditor
              value={(block as any).text}
              onChange={(text) => onChange({ ...block, text } as ContentBlock)}
              compact
              multiline
              editorClassName="w-full rounded px-1.5 py-1 text-[#fafafa] italic"
              editorStyle={{ fontSize: "14px", minHeight: "92px", lineHeight: blockLineHeight ? `${blockLineHeight}px` : undefined }}
              placeholder="Texto da citacao..."
            />
            {blockLineHeight && (
              <LineHeightControl
                value={blockLineHeight}
                onChange={(value) => onChange({ ...block, lineHeight: clampBlockLineHeight(value) } as ContentBlock)}
              />
            )}
            <SelectionProtectedInput
              value={(block as any).author}
              onChange={(e) => onChange({ ...block, author: e.target.value } as ContentBlock)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-[#aaa] focus:outline-none focus:border-[#555]"
              style={{ fontSize: "12px" }}
              placeholder="Autor (opcional)..."
            />
            <div className="space-y-1">
              <span className="block text-[#666]" style={{ fontSize: "11px" }}>Cor da barra lateral</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={sanitizeHexColor((block as any).accentColor) || "#00ff3c"}
                  onChange={(e) => onChange({ ...block, accentColor: e.target.value } as ContentBlock)}
                  className="h-9 w-10 rounded cursor-pointer border-none p-0"
                  style={{ backgroundColor: "transparent" }}
                />
                <SelectionProtectedInput
                  value={sanitizeHexColor((block as any).accentColor) || ""}
                  onChange={(e) => onChange({ ...block, accentColor: e.target.value } as ContentBlock)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-[#aaa] focus:outline-none focus:border-[#555]"
                  style={{ fontSize: "12px" }}
                  placeholder="#00ff3c"
                />
              </div>
            </div>
          </div>
        )}

        {block.type === "cta" && (
          <div className="space-y-2">
            <RichTextEditor
              value={(block as any).text}
              onChange={(text) => onChange({ ...block, text } as ContentBlock)}
              compact
              multiline
              editorClassName="w-full rounded px-1.5 py-1 text-[#fafafa]"
              editorStyle={{ fontSize: "14px", minHeight: "72px", lineHeight: blockLineHeight ? `${blockLineHeight}px` : undefined }}
              placeholder="Texto do CTA..."
            />
            {blockLineHeight && (
              <LineHeightControl
                value={blockLineHeight}
                onChange={(value) => onChange({ ...block, lineHeight: clampBlockLineHeight(value) } as ContentBlock)}
              />
            )}
            <div className="grid grid-cols-2 gap-2">
              <RichTextEditor
                value={(block as any).buttonText}
                onChange={(buttonText) => onChange({ ...block, buttonText } as ContentBlock)}
                multiline={false}
                compact
                allowLinks={false}
                placeholder="Texto do botao..."
                editorClassName="rounded px-2.5 py-1.5 text-[#aaa]"
                editorStyle={{ fontSize: "12px", backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", minHeight: "34px" }}
                placeholderClassName="px-2.5 py-1.5"
              />
              <SelectionProtectedInput
                value={(block as any).buttonUrl}
                onChange={(e) => onChange({ ...block, buttonUrl: e.target.value } as ContentBlock)}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-[#aaa] focus:outline-none focus:border-[#555]"
                style={{ fontSize: "12px" }}
                placeholder="URL do botao (opcional)..."
              />
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer px-1">
              <input
                type="checkbox"
                checked={(block as any).openInNewTab !== false}
                onChange={(e) => onChange({ ...block, openInNewTab: e.target.checked } as ContentBlock)}
                className="accent-[#00ff3c] w-3.5 h-3.5"
              />
              <span className="text-[#888]" style={{ fontSize: "11px" }}>Abrir em nova aba</span>
            </label>
          </div>
        )}

        {block.type === "cards" && (() => {
          const cardsBlock = block as Extract<ContentBlock, { type: "cards" }>;
          const cards = cardsBlock.cards || [];

          const moveCard = (cardIndex: number, direction: -1 | 1) => {
            const nextIndex = cardIndex + direction;
            if (nextIndex < 0 || nextIndex >= cards.length) return;
            const nextCards = [...cards];
            const [movedCard] = nextCards.splice(cardIndex, 1);
            nextCards.splice(nextIndex, 0, movedCard);
            onChange({ ...cardsBlock, cards: nextCards } as ContentBlock);
          };

          return (
            <div className="space-y-3">
              <input
                ref={cardFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file && activeCardUploadIndex !== null) {
                    void handleCardImageUpload(file, activeCardUploadIndex);
                  }
                  event.currentTarget.value = "";
                }}
              />

              <div className="grid grid-cols-1 gap-3 min-[980px]:grid-cols-2">
                {cards.map((card, cardIndex) => (
                  <div
                    key={cardIndex}
                    className="space-y-3 rounded-lg border p-3"
                    style={{ borderColor: "#2a2a2a", backgroundColor: "#141414" }}
                    onMouseDown={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#777]" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Card {cardIndex + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveCard(cardIndex, -1)}
                          disabled={cardIndex === 0}
                          className="rounded border border-[#2a2a2a] p-1 text-[#555] transition-colors hover:text-white disabled:opacity-25"
                          title="Mover para cima"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveCard(cardIndex, 1)}
                          disabled={cardIndex === cards.length - 1}
                          className="rounded border border-[#2a2a2a] p-1 text-[#555] transition-colors hover:text-white disabled:opacity-25"
                          title="Mover para baixo"
                        >
                          <ChevronDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onChange({ ...cardsBlock, cards: cards.filter((_, index) => index !== cardIndex) } as ContentBlock)}
                          className="rounded border border-[#2a2a2a] p-1 text-[#555] transition-colors hover:text-red-400"
                          title="Remover card"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <FieldLabel>Imagem</FieldLabel>
                      {card.image ? (
                        <div className="overflow-hidden rounded-md border" style={{ borderColor: "#2a2a2a", backgroundColor: "#0f0f0f" }}>
                          <ContentImage
                            src={card.image}
                            alt=""
                            className="w-full object-cover"
                            position={card.imagePosition || "50% 50%"}
                            style={{ aspectRatio: "16 / 10" }}
                          />
                        </div>
                      ) : null}
                      <div className="grid grid-cols-1 gap-2 min-[720px]:grid-cols-[1fr_auto_auto]">
                        <MiniInput
                          value={card.image || ""}
                          onChange={(image) => updateCardItem(cardIndex, { image })}
                          placeholder="URL da imagem (opcional)"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCardUploadIndex(cardIndex);
                            cardFileInputRef.current?.click();
                          }}
                          disabled={uploading}
                          className="inline-flex h-[36px] items-center justify-center gap-1.5 rounded border border-[#2a2a2a] px-3 text-[#aaa] transition-colors hover:border-[#555] hover:text-white disabled:opacity-50"
                          style={{ fontSize: "12px" }}
                        >
                          <Upload size={12} /> Enviar
                        </button>
                        {card.image ? (
                          <button
                            type="button"
                            onClick={() => updateCardItem(cardIndex, { image: "", imagePosition: "50% 50%" })}
                            className="inline-flex h-[36px] items-center justify-center rounded border border-[#2a2a2a] px-3 text-[#777] transition-colors hover:text-red-400"
                            style={{ fontSize: "12px" }}
                          >
                            Remover
                          </button>
                        ) : null}
                      </div>
                      {card.image && supportsPositionEditor(card.image) ? (
                        <ImagePositionEditorCompact
                          src={card.image}
                          position={card.imagePosition || "50% 50%"}
                          onChange={(imagePosition) => updateCardItem(cardIndex, { imagePosition })}
                          onRemove={() => updateCardItem(cardIndex, { image: "", imagePosition: "50% 50%" })}
                          height={150}
                        />
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      <FieldLabel>Titulo</FieldLabel>
                      <MiniInput
                        value={card.title || ""}
                        onChange={(title) => updateCardItem(cardIndex, { title })}
                        placeholder="Titulo do card (opcional)"
                      />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel>Descricao</FieldLabel>
                      <MiniTextarea
                        value={card.description || ""}
                        onChange={(description) => updateCardItem(cardIndex, { description })}
                        placeholder="Descricao do card (opcional)"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2 min-[720px]:grid-cols-2">
                      <div className="space-y-1">
                        <FieldLabel>Texto do CTA</FieldLabel>
                        <MiniInput
                          value={card.ctaText || ""}
                          onChange={(ctaText) => updateCardItem(cardIndex, { ctaText })}
                          placeholder="CTA (opcional)"
                        />
                      </div>
                      <div className="space-y-1">
                        <FieldLabel>URL do CTA</FieldLabel>
                        <MiniInput
                          value={card.ctaUrl || ""}
                          onChange={(ctaUrl) => updateCardItem(cardIndex, { ctaUrl })}
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer px-1">
                      <input
                        type="checkbox"
                        checked={card.openInNewTab !== false}
                        onChange={(event) => updateCardItem(cardIndex, { openInNewTab: event.target.checked })}
                        className="h-3.5 w-3.5 accent-[#00ff3c]"
                      />
                      <span className="text-[#888]" style={{ fontSize: "11px" }}>Abrir CTA em nova aba</span>
                    </label>

                    <div className="grid grid-cols-1 gap-2 min-[720px]:grid-cols-2">
                      <div className="space-y-1">
                        <FieldLabel>Background</FieldLabel>
                        <ColorInput
                          value={card.backgroundColor || ""}
                          onChange={(backgroundColor) => updateCardItem(cardIndex, { backgroundColor })}
                          placeholder="#0F1012"
                        />
                      </div>
                      <div className="space-y-1">
                        <FieldLabel>Borda</FieldLabel>
                        <ColorInput
                          value={card.borderColor || ""}
                          onChange={(borderColor) => updateCardItem(cardIndex, { borderColor })}
                          placeholder="#2A2A2A"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...cardsBlock,
                    cards: [
                      ...cards,
                      {
                        title: "",
                        description: "",
                        image: "",
                        imagePosition: "50% 50%",
                        ctaText: "",
                        ctaUrl: "",
                        openInNewTab: true,
                        backgroundColor: "#0F1012",
                        borderColor: "#2A2A2A",
                      },
                    ],
                  } as ContentBlock)
                }
                className="flex items-center gap-1 text-[#666] transition-colors hover:text-[#aaa]"
                style={{ fontSize: "12px" }}
              >
                <Plus size={12} /> Adicionar card
              </button>
            </div>
          );
        })()}

        {block.type === "embed" && (
          (() => {
            const embedBlock = block as Extract<ContentBlock, { type: "embed" }>;
            const resolvedEmbed = resolveEmbed(embedBlock.url, embedBlock.height);
            const currentHeight = embedBlock.height ?? resolvedEmbed.height;

            return (
              <div className="space-y-3">
                <SelectionProtectedTextarea
                  value={embedBlock.url}
                  onChange={(e) => onChange({ ...embedBlock, url: e.target.value } as ContentBlock)}
                  className="min-h-[92px] w-full resize-y rounded border border-[#2a2a2a] bg-[#1a1a1a] px-2.5 py-2 text-[#fafafa] focus:outline-none focus:border-[#555]"
                  style={{ fontSize: "13px", lineHeight: "20px" }}
                  placeholder={"Cole a URL publica ou o iframe completo.\nEx.: Figma, Figma Sites, pagina web, Notion, Miro, Loom, YouTube, Vimeo..."}
                />

                <div className="flex flex-wrap items-center gap-2 px-1">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-1"
                    style={{ fontSize: "11px", lineHeight: "14px", backgroundColor: "#141414", color: "#888", border: "1px solid #242424" }}
                  >
                    {resolvedEmbed.providerLabel}
                  </span>
                  {resolvedEmbed.sourceUrl && (
                    <a
                      href={resolvedEmbed.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#666] transition-colors hover:text-[#aaa]"
                      style={{ fontSize: "11px" }}
                    >
                      Abrir original
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 px-1">
                  <span className="text-[#666] shrink-0" style={{ fontSize: "11px" }}>Altura</span>
                  <input
                    type="range"
                    min={280}
                    max={960}
                    step={10}
                    value={currentHeight}
                    onChange={(e) => onChange({ ...embedBlock, height: Number(e.target.value) } as ContentBlock)}
                    className="flex-1 h-1 cursor-pointer"
                    style={{ accentColor: "#00ff3c" }}
                  />
                  <span className="text-[#555] w-12 text-right tabular-nums" style={{ fontSize: "11px" }}>
                    {currentHeight}px
                  </span>
                </div>

                {resolvedEmbed.helpText && (
                  <p className="px-1 text-[#666]" style={{ fontSize: "11px", lineHeight: "16px" }}>
                    {resolvedEmbed.helpText}
                  </p>
                )}

                {embedBlock.url.trim() ? (
                  <ContentEmbed block={{ ...embedBlock, height: currentHeight }} preview />
                ) : null}

                <RichTextEditor
                  value={embedBlock.caption}
                  onChange={(caption) => onChange({ ...embedBlock, caption } as ContentBlock)}
                  multiline={false}
                  compact
                  placeholder="Legenda (opcional)..."
                  editorClassName="w-full rounded px-2.5 py-1.5 text-[#aaa]"
                  editorStyle={{ fontSize: "12px", backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", minHeight: "34px" }}
                  placeholderClassName="px-2.5 py-1.5"
                />
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}

function BlockEditorInner({ blocks, onChange }: { blocks: ContentBlock[]; onChange: (blocks: ContentBlock[]) => void }) {
  const addBlock = (type: ContentBlock["type"], atIndex?: number) => {
    const newBlock = createBlock(type);
    if (atIndex !== undefined) {
      const newBlocks = [...blocks];
      newBlocks.splice(atIndex + 1, 0, newBlock);
      onChange(newBlocks);
    } else {
      onChange([...blocks, newBlock]);
    }
  };

  const updateBlock = (index: number, block: ContentBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = block;
    onChange(newBlocks);
  };

  const removeBlock = (index: number) => onChange(blocks.filter((_, i) => i !== index));

  const moveBlockByButton = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  const moveBlockByDrag = useCallback((dragIndex: number, hoverIndex: number) => {
    const newBlocks = [...blocks];
    const [removed] = newBlocks.splice(dragIndex, 1);
    newBlocks.splice(hoverIndex, 0, removed);
    onChange(newBlocks);
  }, [blocks, onChange]);

  return (
    <div className="space-y-2">
      <label className="text-[#ababab] block mb-2" style={{ fontSize: "13px" }}>
        Conteudo (blocos) — arraste para reordenar
      </label>
      <div className="space-y-2">
        {blocks.map((block, i) => (
          <div key={`block-${i}-${block.type}`} className="space-y-2">
            <DraggableBlock
              block={block}
              index={i}
              total={blocks.length}
              onChange={(b) => updateBlock(i, b)}
              onRemove={() => removeBlock(i)}
              onMove={(dir) => moveBlockByButton(i, dir)}
              moveBlock={moveBlockByDrag}
            />
            {i < blocks.length - 1 && (
              <BlockTypeSelector compact onSelect={(type) => addBlock(type, i)} />
            )}
          </div>
        ))}
      </div>
      <BlockTypeSelector onSelect={(type) => addBlock(type)} />
    </div>
  );
}

export function BlockEditor({ blocks, onChange }: { blocks: ContentBlock[]; onChange: (blocks: ContentBlock[]) => void }) {
  return (
    <DndProvider backend={HTML5Backend}>
      <BlockEditorInner blocks={blocks} onChange={onChange} />
    </DndProvider>
  );
}
