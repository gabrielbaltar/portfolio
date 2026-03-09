import { BlockEditor } from "./block-editor";
import { toast } from "sonner";
import { VersionHistoryPanel, saveVersion, getVersions } from "./version-history";
import { ImagePositionEditor, ImagePositionEditorCompact } from "./image-position-editor";
import { VideoPlayer } from "./video-player";
import { useState, useEffect, useCallback, useRef } from "react";
import { ensureUniqueSlug, isReservedPageSlug, slugify } from "@portfolio/core";
import { useParams, useNavigate, Link } from "react-router";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ArrowLeft, Save, Eye, Send,
  PanelLeft, Columns, Monitor, Smartphone,
  ChevronDown, ChevronUp, Hash, Globe,
  Plus, Upload, X, History, Lock, LockOpen, Video, Code, GripVertical, RotateCcw,
} from "lucide-react";
import { useCMS, type ContentBlock, type ContentStatus, type Project, type BlogPost, type Page } from "./cms-data";
import { dataProvider } from "./data-provider";
import {
  clampBlockLineHeight,
  CODE_LANGUAGE_OPTIONS,
  getBlockLineHeight,
  getCodeLanguageLabel,
  isAdjustableLineHeightBlock,
} from "./content-block-utils";
import { LineHeightControl } from "./line-height-control";
import { CodeHighlight } from "./code-highlight";
import { RichTextContent, RichTextEditor, richTextToPlainText } from "./rich-text";
import { ShowcaseBlockView, isShowcaseBlock } from "./showcase-blocks";

// Editor types
type EditorMode = "form" | "visual" | "split";
type ContentType = "projects" | "articles" | "pages";
type EditorSection = {
  key: string;
  title: string;
  defaultOpen?: boolean;
  content: React.ReactNode;
};

const FORM_SECTION_DND_TYPE = "EDITOR_FORM_SECTION";
const SECTION_ORDER_STORAGE_PREFIX = "cms-editor-section-order:";
const DEFAULT_SECTION_ORDER: Record<ContentType, string[]> = {
  projects: ["basics", "images", "content", "organization", "protection", "seo"],
  articles: ["basics", "images", "content", "organization", "protection", "seo"],
  pages: ["basics", "content", "seo"],
};

type SectionDragItem = {
  index: number;
  type: string;
};

function normalizeSectionOrder(stored: string[], available: string[]) {
  return [
    ...stored.filter((key) => available.includes(key)),
    ...available.filter((key) => !stored.includes(key)),
  ];
}

function readSectionOrder(contentType: ContentType) {
  const fallback = DEFAULT_SECTION_ORDER[contentType];
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(`${SECTION_ORDER_STORAGE_PREFIX}${contentType}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return normalizeSectionOrder(parsed.filter((item): item is string => typeof item === "string"), fallback);
  } catch {
    return fallback;
  }
}

function writeSectionOrder(contentType: ContentType, order: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${SECTION_ORDER_STORAGE_PREFIX}${contentType}`, JSON.stringify(order));
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

function getDividerSpacing(block: Extract<ContentBlock, { type: "divider" }>) {
  return Math.max(24, Math.min(160, block.spacing ?? 72));
}

function getImageFiles(files: FileList | File[]) {
  return Array.from(files).filter((file) => file.type.startsWith("image/"));
}

// Reusable form components
function Input({ label, value, onChange, placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[#777]" style={{ fontSize: "11px", lineHeight: "16.5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[37.5px] w-full rounded-[10px] px-3 text-[#fafafa] placeholder:text-[#ababab] focus:outline-none transition-colors"
        style={{ fontSize: "13px", lineHeight: "19.5px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3, placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[#777]" style={{ fontSize: "11px", lineHeight: "16.5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-none rounded-[10px] px-3 py-2 text-[#fafafa] placeholder:text-[#ababab] focus:outline-none transition-colors"
        style={{ minHeight: rows === 3 ? "76.5px" : undefined, fontSize: "13px", lineHeight: "19.5px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
      />
    </div>
  );
}

function TagsInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");
  const add = () => {
    const tag = input.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput("");
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tags</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md cursor-pointer hover:opacity-70"
            style={{ fontSize: "11px", backgroundColor: "#1e1e1e", color: "#aaa" }}
            onClick={() => onChange(tags.filter(t => t !== tag))}
          >
            <Hash size={10} />{tag} <X size={10} />
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Adicionar tag..."
          className="flex-1 rounded-lg px-3 py-1.5 text-[#fafafa] placeholder-[#444] focus:outline-none"
          style={{ fontSize: "12px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
        />
      </div>
    </div>
  );
}

function StatusSelector({ status, onChange }: { status: ContentStatus; onChange: (s: ContentStatus) => void }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const config: Record<ContentStatus, { color: string; label: string }> = {
    draft: { color: "#ffa500", label: "Rascunho" },
    review: { color: "#3b82f6", label: "Em revisao" },
    published: { color: "#00ff3c", label: "Publicado" },
    archived: { color: "#888", label: "Arquivado" },
  };
  const current = config[status];

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="flex h-8 items-center gap-2 rounded-[10px] px-[13px] cursor-pointer transition-colors hover:bg-[#1a1a1a]"
        style={{ fontSize: "12px", lineHeight: "18px", border: "1px solid #1e1e1e" }}
      >
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: current.color }} />
        <span className="text-[#ccc]">{current.label}</span>
        <ChevronDown size={12} className="text-[#555]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 rounded-lg shadow-xl py-1 min-w-[150px]"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", top: pos.top, right: pos.right }}
          >
            {(Object.keys(config) as ContentStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2 w-full text-left cursor-pointer transition-colors ${
                  s === status ? "bg-[#242424]" : "hover:bg-[#1e1e1e]"
                }`}
                style={{ fontSize: "12px", color: "#ccc" }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config[s].color }} />
                {config[s].label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FormSection({ title, children, defaultOpen = true, headerPrefix, headerSuffix }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; headerPrefix?: React.ReactNode; headerSuffix?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-[14px]" style={{ backgroundColor: "#111", border: "1px solid #1e1e1e" }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-[43.5px] w-full items-center justify-between px-4 cursor-pointer transition-colors hover:bg-[#141414]"
      >
        <div className="flex min-w-0 items-center gap-2">
          {headerPrefix}
          <span className="truncate text-[#ddd]" style={{ fontSize: "13px", lineHeight: "19.5px" }}>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {headerSuffix}
          {open ? <ChevronUp size={14} className="text-[#555]" /> : <ChevronDown size={14} className="text-[#555]" />}
        </div>
      </button>
      {open && <div className="space-y-4 px-4 pb-4">{children}</div>}
    </div>
  );
}

function DraggableFormSection({
  section,
  index,
  moveSection,
}: {
  section: EditorSection;
  index: number;
  moveSection: (dragIndex: number, hoverIndex: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: FORM_SECTION_DND_TYPE,
    item: (): SectionDragItem => ({ index, type: FORM_SECTION_DND_TYPE }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop<SectionDragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: FORM_SECTION_DND_TYPE,
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveSection(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drag(handleRef);
  drop(ref);

  return (
    <div
      ref={ref}
      className={`rounded-[16px] transition-all ${
        isDragging
          ? "opacity-50 scale-[0.99]"
          : isOver && canDrop
          ? "shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
          : ""
      }`}
    >
      <FormSection
        title={section.title}
        defaultOpen={section.defaultOpen}
        headerPrefix={(
          <span
            ref={handleRef}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex cursor-grab items-center justify-center rounded-md p-1 text-[#555] transition-colors hover:text-[#aaa] active:cursor-grabbing"
            title="Arrastar para reordenar"
          >
            <GripVertical size={13} />
          </span>
        )}
      >
        {section.content}
      </FormSection>
    </div>
  );
}

// Visual Preview with inline editing & live read-only mode
function VisualPreview({ item, contentType, onUpdate, previewMode, readOnly = false }: {
  item: any;
  contentType: ContentType;
  onUpdate: (field: string, value: any) => void;
  previewMode: "desktop" | "mobile";
  readOnly?: boolean;
}) {
  const handleInlineEdit = (field: string, e: React.FocusEvent<HTMLElement>) => {
    if (readOnly) return;
    const newText = e.currentTarget.textContent || "";
    onUpdate(field, newText);
  };

  const updateBlock = (index: number, updater: (block: ContentBlock) => ContentBlock) => {
    const blocks = [...(item.contentBlocks || [])];
    if (blocks[index]) {
      blocks[index] = updater(blocks[index]);
      onUpdate("contentBlocks", blocks);
    }
  };

  const renderText = (
    Tag: keyof React.JSX.IntrinsicElements,
    field: string,
    text: string,
    placeholder: string,
    className: string,
    style: React.CSSProperties,
    key?: string | number
  ) => {
    if (readOnly) {
      const El = Tag as any;
      return <El key={key} className={className} style={style}>{text || <span className="opacity-30">{placeholder}</span>}</El>;
    }
    const El = Tag as any;
    return (
      <El
        key={key}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e: any) => handleInlineEdit(field, e)}
        className={`${className} outline-none focus:ring-1 focus:ring-[#333] rounded px-1 -mx-1 cursor-text`}
        style={{ ...style, minHeight: style.lineHeight || "24px" }}
      >
        {text || placeholder}
      </El>
    );
  };

  const renderBlockRichText = (
    index: number,
    field: string,
    text: string,
    placeholder: string,
    wrapperClassName: string,
    wrapperStyle: React.CSSProperties,
    multiline = true,
  ) => {
    if (readOnly) {
      return (
        <div key={index} className={wrapperClassName} style={wrapperStyle}>
          <RichTextContent value={text} placeholder={placeholder} />
        </div>
      );
    }

    return (
      <RichTextEditor
        key={index}
        value={text}
        onChange={(nextValue) => updateBlock(index, (block) => ({ ...block, [field]: nextValue } as ContentBlock))}
        placeholder={placeholder}
        multiline={multiline}
        compact
        containerClassName="space-y-1"
        editorClassName={`${wrapperClassName} rounded px-1 -mx-1`}
        editorStyle={wrapperStyle}
      />
    );
  };

  const renderPreviewLineHeightControl = (index: number, block: ContentBlock) => {
    if (readOnly || !isAdjustableLineHeightBlock(block)) return null;

    return (
      <LineHeightControl
        compact
        value={getBlockLineHeight(block)}
        onChange={(value) =>
          updateBlock(index, (currentBlock) => ({ ...currentBlock, lineHeight: clampBlockLineHeight(value) } as ContentBlock))
        }
      />
    );
  };

  return (
    <div
      className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[14px]"
      style={{ backgroundColor: "#0a0a0a", border: "1px solid #1e1e1e" }}
    >
      {/* Preview toolbar */}
      <div className="flex h-[43.5px] shrink-0 items-center justify-between border-b px-4" style={{ borderColor: "#1e1e1e" }}>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: readOnly ? "#00ff3c" : "#ffa500" }} />
          <span className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16.5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {readOnly ? "Preview ao vivo" : "Preview editavel"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <span className="text-[#444]" style={{ fontSize: "10px" }}>
              Clique no texto para editar inline
            </span>
          )}
          {item.status && (
            <span
              className="inline-flex h-[20.5px] items-center rounded-full px-2"
              style={{
                fontSize: "10px",
                lineHeight: "15px",
                backgroundColor: item.status === "published" ? "#00ff3c15" : item.status === "draft" ? "#ffa50015" : item.status === "review" ? "#3b82f615" : "#55555515",
                color: item.status === "published" ? "#00ff3c" : item.status === "draft" ? "#ffa500" : item.status === "review" ? "#3b82f6" : "#888",
              }}
            >
              {item.status === "published" ? "Publicado" : item.status === "draft" ? "Rascunho" : item.status === "review" ? "Revisao" : "Arquivado"}
            </span>
          )}
        </div>
      </div>

      {/* Preview content */}
      <div
        className="flex-1 overflow-y-auto px-5 py-6 md:px-7 md:py-8"
        style={{
          width: "100%",
          maxWidth: previewMode === "mobile" ? "375px" : undefined,
          margin: previewMode === "mobile" ? "0 auto" : undefined,
        }}
      >
        {/* Cover image */}
        {item.image && (
          <div className="mb-8 overflow-hidden rounded-[12px]" style={{ backgroundColor: item.imageBgColor || "transparent" }}>
            <img src={item.image} alt={item.title} className="w-full object-cover" style={{ maxHeight: "220px" }} />
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {item.tags.map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 rounded-md" style={{ fontSize: "11px", backgroundColor: "#1e1e1e", color: "#888" }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        {renderText("h1", "title", item.title, "Titulo do conteudo", "mb-2 text-[#fafafa]", { fontSize: "28px", lineHeight: "36px", fontWeight: 500 })}

        {/* Subtitle / Description */}
        {(contentType === "projects" || contentType === "articles") &&
          renderText(
            "p",
            contentType === "projects" ? "subtitle" : "subtitle",
            contentType === "projects" ? item.subtitle : (item.subtitle || item.description),
            "Descricao...",
            "mb-6 text-[#4f4f4f]",
            { fontSize: "15px", lineHeight: "24px" }
          )
        }

        {/* Meta info for projects */}
        {contentType === "projects" && (
          <div className="mb-6 flex flex-wrap items-center gap-5 border-y py-3" style={{ borderColor: "#1e1e1e", fontSize: "12px", lineHeight: "18px", color: "#666" }}>
            <span>Cliente: {item.client || "—"}</span>
            <span>Ano: {item.year || "—"}</span>
            <span>Servicos: {item.services || "—"}</span>
            {item.link && item.link !== "#" && (
              <span className="flex items-center gap-1"><Globe size={10} /><span className="truncate max-w-[120px]">{item.link}</span></span>
            )}
          </div>
        )}

        {/* Meta info for articles */}
        {contentType === "articles" && (
          <div className="mb-6 flex flex-wrap items-center gap-5 border-y py-3" style={{ borderColor: "#1e1e1e", fontSize: "12px", lineHeight: "18px", color: "#666" }}>
            <span>Autor: {item.author || "—"}</span>
            <span>Data: {item.date || "—"}</span>
            <span>Leitura: {item.readTime || "—"}</span>
            {item.publisher && <span>Publicacao: {item.publisher}</span>}
            {item.category && <span>Categoria: {item.category}</span>}
          </div>
        )}

        {/* Password indicator */}
        {item.password && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg" style={{ backgroundColor: "#ffa50010", border: "1px solid #ffa50020" }}>
            <Lock size={12} className="text-[#ffa500]" />
            <span style={{ fontSize: "11px", color: "#ffa500" }}>Protegido por senha</span>
          </div>
        )}

        {/* Content blocks */}
        <div className="space-y-6">
          {(item.contentBlocks || []).map((block: ContentBlock, i: number) => {
            if (isShowcaseBlock(block)) {
              return <ShowcaseBlockView key={i} block={block} variant="preview" />;
            }

            switch (block.type) {
              case "heading1":
                return (
                  <div key={i} className="space-y-2">
                    {renderPreviewLineHeightControl(i, block)}
                    {renderBlockRichText(i, "text", block.text, "Titulo H1...", "text-[#fafafa]", { fontSize: "22px", lineHeight: `${getBlockLineHeight(block)}px`, fontWeight: 500 })}
                  </div>
                );
              case "heading2":
                return (
                  <div key={i} className="space-y-2">
                    {renderPreviewLineHeightControl(i, block)}
                    {renderBlockRichText(i, "text", block.text, "Titulo H2...", "text-[#fafafa]", { fontSize: "18px", lineHeight: `${getBlockLineHeight(block)}px`, fontWeight: 500 })}
                  </div>
                );
              case "heading3":
                return (
                  <div key={i} className="space-y-2">
                    {renderPreviewLineHeightControl(i, block)}
                    {renderBlockRichText(i, "text", block.text, "Titulo H3...", "text-[#fafafa]", { fontSize: "16px", lineHeight: `${getBlockLineHeight(block)}px`, fontWeight: 500 })}
                  </div>
                );
              case "paragraph":
                return (
                  <div key={i} className="space-y-2">
                    {renderPreviewLineHeightControl(i, block)}
                    {renderBlockRichText(i, "text", block.text, "Escreva seu texto aqui...", "text-[#999]", { fontSize: "14px", lineHeight: `${getBlockLineHeight(block)}px` })}
                  </div>
                );
              case "unordered-list":
              case "ordered-list": {
                const ListTag = block.type === "ordered-list" ? "ol" : "ul";
                return (
                  <div key={i} className="space-y-2">
                    {renderPreviewLineHeightControl(i, block)}
                    <ListTag className="pl-5 space-y-1" style={{ listStyleType: block.type === "ordered-list" ? "decimal" : "disc" }}>
                      {block.items.map((listItem: string, j: number) => (
                        <li key={j} className="text-[#999]" style={{ fontSize: "14px", lineHeight: `${getBlockLineHeight(block)}px` }}>
                          {readOnly ? (
                            <RichTextContent value={listItem} placeholder="Item..." />
                          ) : (
                            <RichTextEditor
                              value={listItem}
                              onChange={(nextValue) =>
                                updateBlock(i, (currentBlock) => {
                                  const listBlock = currentBlock as Extract<ContentBlock, { type: "unordered-list" | "ordered-list" }>;
                                  const nextItems = [...listBlock.items];
                                  nextItems[j] = nextValue;
                                  return { ...listBlock, items: nextItems };
                                })
                              }
                              onEnter={() =>
                                updateBlock(i, (currentBlock) => {
                                  const listBlock = currentBlock as Extract<ContentBlock, { type: "unordered-list" | "ordered-list" }>;
                                  const nextItems = [...listBlock.items];
                                  nextItems.splice(j + 1, 0, "");
                                  return { ...listBlock, items: nextItems };
                                })
                              }
                              onBackspaceEmpty={() =>
                                updateBlock(i, (currentBlock) => {
                                  const listBlock = currentBlock as Extract<ContentBlock, { type: "unordered-list" | "ordered-list" }>;
                                  if (listBlock.items.length <= 1) return listBlock;
                                  return { ...listBlock, items: listBlock.items.filter((_, itemIndex: number) => itemIndex !== j) };
                                })
                              }
                              multiline={false}
                              compact
                              placeholder="Item..."
                              editorClassName="text-[#999] rounded px-1 -mx-1"
                              editorStyle={{ fontSize: "14px", lineHeight: `${getBlockLineHeight(block)}px` }}
                            />
                          )}
                        </li>
                      ))}
                    </ListTag>
                  </div>
                );
              }
              case "code":
                return (
                  <div
                    key={i}
                    className="overflow-hidden rounded-xl"
                    style={{ backgroundColor: "#111", border: "1px solid #1e1e1e" }}
                  >
                    <div
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-2"
                      style={{ borderBottom: "1px solid #1e1e1e" }}
                    >
                      {readOnly ? (
                        <span className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {getCodeLanguageLabel(block.language)}
                        </span>
                      ) : (
                        <select
                          value={block.language}
                          onChange={(event) => updateBlock(i, (currentBlock) => ({ ...currentBlock, language: event.target.value } as ContentBlock))}
                          className="h-[30px] rounded border px-2 text-[#fafafa] focus:outline-none"
                          style={{ backgroundColor: "#141414", borderColor: "#2a2a2a", fontSize: "12px" }}
                        >
                          {CODE_LANGUAGE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    {readOnly ? (
                      <CodeHighlight code={block.code} language={block.language} variant="editor" />
                    ) : (
                      <CodeHighlight
                        code={block.code}
                        language={block.language}
                        variant="editor"
                        editable
                        minHeight={180}
                        placeholder="// cole seu codigo aqui"
                        onChange={(nextCode) =>
                          updateBlock(i, (currentBlock) => ({ ...currentBlock, code: nextCode } as ContentBlock))
                        }
                      />
                    )}
                    {block.caption && (
                      <div className="border-t px-4 py-2 text-[#666]" style={{ borderColor: "#1e1e1e", fontSize: "12px" }}>
                        <RichTextContent value={block.caption} />
                      </div>
                    )}
                  </div>
                );
              case "image":
                return block.url ? (
                  <figure key={i} className="my-6">
                    <img src={block.url} alt={richTextToPlainText(block.caption) || ""} className="w-full rounded-lg object-cover max-h-[300px]" />
                    {block.caption && (
                      <figcaption className="text-center mt-2 text-[#666]" style={{ fontSize: "12px" }}>
                        <RichTextContent value={block.caption} />
                      </figcaption>
                    )}
                  </figure>
                ) : (
                  <div key={i} className="rounded-lg py-8 text-center" style={{ backgroundColor: "#141414", border: "1px dashed #2a2a2a" }}>
                    <span className="text-[#555]" style={{ fontSize: "13px" }}>Imagem</span>
                  </div>
                );
              case "video": {
                const vBlock = block as any;
                return vBlock.url ? (
                  <figure key={i} className="my-6">
                    <VideoPlayer
                      src={vBlock.url}
                      poster={vBlock.poster || undefined}
                      autoPlay={vBlock.autoplay || false}
                      loop={vBlock.loop || false}
                      muted={vBlock.muted || vBlock.autoplay || false}
                      height={300}
                      fit={vBlock.fit || "contain"}
                      zoom={vBlock.zoom ?? 1}
                    />
                    {vBlock.caption && (
                      <figcaption className="text-center mt-2 text-[#666]" style={{ fontSize: "12px" }}>{vBlock.caption}</figcaption>
                    )}
                  </figure>
                ) : (
                  <div key={i} className="rounded-lg py-8 text-center flex flex-col items-center gap-1" style={{ backgroundColor: "#141414", border: "1px dashed #2a2a2a" }}>
                    <Video size={18} className="text-[#555]" />
                    <span className="text-[#555]" style={{ fontSize: "13px" }}>Video</span>
                  </div>
                );
              }
              case "quote":
                return (
                  <div key={i} className="space-y-2">
                    {renderPreviewLineHeightControl(i, block)}
                    <blockquote className="border-l-2 pl-4 py-2 my-6" style={{ borderColor: "#333" }}>
                      {renderBlockRichText(i, "text", (block as any).text, "Texto da citacao...", "text-[#ccc] italic", { fontSize: "15px", lineHeight: `${getBlockLineHeight(block)}px` })}
                      {(block as any).author && (
                        <cite className="text-[#666] not-italic block mt-2" style={{ fontSize: "12px" }}>— {(block as any).author}</cite>
                      )}
                    </blockquote>
                  </div>
                );
              case "divider":
                return (
                  <hr
                    key={i}
                    style={{
                      borderColor: "#1e1e1e",
                      marginTop: `${getDividerSpacing(block)}px`,
                      marginBottom: `${getDividerSpacing(block)}px`,
                    }}
                  />
                );
              case "cta":
                return (
                  <div key={i} className="space-y-2">
                    {renderPreviewLineHeightControl(i, block)}
                    <div className="rounded-xl p-6 text-center my-6" style={{ backgroundColor: "#141414", border: "1px solid #1e1e1e" }}>
                      {renderBlockRichText(i, "text", (block as any).text, "Texto do CTA...", "text-[#ccc] mb-3", { fontSize: "15px", lineHeight: `${getBlockLineHeight(block)}px` })}
                      {readOnly ? (
                        <span className="inline-block rounded-lg bg-[#fafafa] px-4 py-2 text-[#111] cursor-pointer" style={{ fontSize: "13px" }}>
                          <RichTextContent value={(block as any).buttonText || "Botao"} />
                        </span>
                      ) : (
                        <RichTextEditor
                          value={(block as any).buttonText || ""}
                          onChange={(nextValue) => updateBlock(i, (currentBlock) => ({ ...currentBlock, buttonText: nextValue } as ContentBlock))}
                          placeholder="Texto do botao"
                          multiline={false}
                          compact
                          allowLinks={false}
                          editorClassName="mx-auto inline-block rounded-lg bg-[#fafafa] px-4 py-2 text-[#111]"
                          editorStyle={{ fontSize: "13px", minHeight: "38px" }}
                        />
                      )}
                    </div>
                  </div>
                );
              case "embed":
                return (
                  <div key={i} className="rounded-lg py-6 text-center" style={{ backgroundColor: "#141414", border: "1px dashed #2a2a2a" }}>
                    <Code size={16} className="text-[#555] mx-auto mb-1" />
                    <span className="text-[#555] block" style={{ fontSize: "12px" }}>{(block as any).url || "Embed"}</span>
                  </div>
                );
              default:
                return null;
            }
          })}
        </div>

        {(!item.contentBlocks || item.contentBlocks.length === 0) && (
          <div className="pt-16 text-center text-[#3f3f3f]" style={{ fontSize: "13px", lineHeight: "19.5px" }}>
            Adicione blocos de conteudo no formulario
          </div>
        )}

        {/* Gallery images */}
        {item.galleryImages && item.galleryImages.length > 0 && (
          <div className="mt-8 pt-6 border-t" style={{ borderColor: "#1e1e1e" }}>
            <span className="text-[#555] block mb-3" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Galeria</span>
            <div className="grid grid-cols-2 gap-2">
              {item.galleryImages.map((img: string, idx: number) => (
                <div key={idx} className="rounded-lg overflow-hidden" style={{ aspectRatio: "16/10" }}>
                  <img src={img} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ImageUrlField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const { addMediaItem } = useCMS();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    setUploading(true);
    try {
      const uploaded = await dataProvider.uploadMedia(file, "public");
      addMediaItem(uploaded);
      onChange(uploaded.url);
      toast.success("Imagem enviada em qualidade original.");
    } catch {
      try {
        const originalDataUrl = await readFileAsDataUrl(file);
        onChange(originalDataUrl);
        toast.info("Upload externo indisponivel. A imagem foi mantida localmente sem compressao.");
      } catch {
        toast.error("Nao foi possivel carregar a imagem.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = getImageFiles(event.dataTransfer.files)[0];
    if (file) void handleUpload(file);
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[#777]" style={{ fontSize: "11px", lineHeight: "16.5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </label>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="rounded-[12px] border p-2 transition-colors"
        style={{
          borderColor: dragOver ? "#3b82f6" : "#1e1e1e",
          backgroundColor: dragOver ? "#111827" : "transparent",
          borderStyle: dragOver ? "solid" : "dashed",
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="h-[37.5px] min-w-0 flex-1 rounded-[10px] px-3 text-[#fafafa] placeholder:text-[#ababab] focus:outline-none transition-colors"
            style={{ fontSize: "13px", lineHeight: "19.5px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-[37.5px] items-center gap-1.5 rounded-[10px] px-3 text-[#ddd] transition-colors hover:bg-[#1a1a1a]"
            style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}
          >
            <Upload size={12} />
            {uploading ? "Enviando..." : "Upload original"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex h-[37.5px] items-center gap-1.5 rounded-[10px] px-3 text-[#999] transition-colors hover:text-red-400"
              style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}
            >
              <X size={12} />
              Limpar
            </button>
          )}
        </div>
        <p className="mt-2 px-1 text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
          {dragOver
            ? "Solte a imagem para enviar em qualidade original."
            : "Arraste uma imagem para este campo ou use o botao de upload."}
        </p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleUpload(file);
          event.currentTarget.value = "";
        }}
      />
      <p className="text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
        Use este upload para manter a qualidade original da capa no projeto ou artigo.
      </p>
    </div>
  );
}

// Gallery Images Editor
function GalleryEditor({ images, onChange, positions, onPositionsChange }: { images: string[]; onChange: (imgs: string[]) => void; positions?: string[]; onPositionsChange?: (positions: string[]) => void }) {
  const { addMediaItem } = useCMS();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (files: FileList | File[]) => {
    const imageFiles = getImageFiles(files);
    if (!imageFiles.length) return;
    setUploading(true);
    const nextImages = [...images];

    try {
      for (const file of imageFiles) {
        try {
          const uploaded = await dataProvider.uploadMedia(file, "public");
          addMediaItem(uploaded);
          nextImages.push(uploaded.url);
        } catch {
          try {
            const originalDataUrl = await readFileAsDataUrl(file);
            nextImages.push(originalDataUrl);
            toast.info("Upload externo indisponivel. A imagem foi mantida localmente sem compressao.");
          } catch {
            toast.error("Nao foi possivel carregar a imagem.");
          }
        }
      }

      onChange(nextImages);
      toast.success(imageFiles.length === 1 ? "Imagem adicionada em qualidade original." : `${imageFiles.length} imagens adicionadas.`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, j) => j !== index));
    if (positions && onPositionsChange) {
      const newPositions = [...(positions || [])];
      newPositions.splice(index, 1);
      onPositionsChange(newPositions);
    }
  };

  const handlePositionChange = (index: number, position: string) => {
    if (!onPositionsChange) return;
    const newPositions = [...(positions || [])];
    // Pad array if needed
    while (newPositions.length <= index) newPositions.push("50% 50%");
    newPositions[index] = position;
    onPositionsChange(newPositions);
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length) {
      void handleUpload(event.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Galeria de imagens</label>
      <div className="grid grid-cols-2 gap-2">
        {images.map((img, i) => (
          <ImagePositionEditorCompact
            key={i}
            src={img}
            position={(positions && positions[i]) || "50% 50%"}
            onChange={(pos) => handlePositionChange(i, pos)}
            onRemove={() => handleRemove(i)}
            height={160}
          />
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className="rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors hover:bg-[#1a1a1a]"
          style={{
            height: "160px",
            border: `1px dashed ${dragOver ? "#3b82f6" : "#2a2a2a"}`,
            backgroundColor: dragOver ? "#111827" : "transparent",
          }}
        >
          <Upload size={14} className="text-[#555]" />
          <span className="text-[#555]" style={{ fontSize: "11px" }}>
            {uploading ? "Enviando..." : dragOver ? "Solte para adicionar" : "Upload original"}
          </span>
          <span className="text-[#444]" style={{ fontSize: "10px" }}>
            Clique ou arraste imagens
          </span>
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handleUpload(e.target.files);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}

export function CMSEditor() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const contentType = type as ContentType;
  const navigate = useNavigate();
  const { data, updateProjects, updateBlogPosts, updatePages } = useCMS();

  const [mode, setMode] = useState<EditorMode>("split");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [hasChanges, setHasChanges] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Get current item
  const getItem = useCallback(() => {
    if (contentType === "projects") return data.projects.find(p => p.id === id);
    if (contentType === "articles") return data.blogPosts.find(b => b.id === id);
    if (contentType === "pages") return (data.pages || []).find(p => p.id === id);
    return null;
  }, [contentType, id, data]);

  const [item, setItem] = useState<any>(() => {
    const found = getItem();
    return found ? { ...found } : null;
  });

  // Autosave timer
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasChanges || !item) return;
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => {
      void saveItem(true);
    }, 3000);
    return () => { if (autosaveRef.current) clearTimeout(autosaveRef.current); };
  }, [item, hasChanges]);

  // Keyboard shortcuts: Ctrl+S (save), Ctrl+Z (undo via history)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      
      // Ctrl+S — save
      if (isMod && e.key === "s") {
        e.preventDefault();
        if (item) void saveItem(false);
      }
      
      // Ctrl+Z — undo (restore latest version from history)
      if (isMod && e.key === "z" && !e.shiftKey) {
        // Only intercept when not inside a text input/textarea (let browser handle native undo there)
        const target = e.target as HTMLElement;
        const isEditable = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
        if (!isEditable && id) {
          e.preventDefault();
          void getVersions(`${contentType}-${id}`).then((versions) => {
            if (versions.length > 0) {
              const latest = versions[0];
              setItem({ ...latest.data, updatedAt: new Date().toISOString() });
              setHasChanges(true);
              toast.success("Desfeito! Estado anterior restaurado.");
            } else {
              toast.info("Nenhuma versao anterior para desfazer.");
            }
          });
        }
      }

      // Ctrl+Shift+H — toggle history panel
      if (isMod && e.shiftKey && e.key === "H") {
        e.preventDefault();
        setShowHistory(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, id, contentType]);

  if (!item) {
    return (
      <div className="max-w-[600px] mx-auto text-center py-20">
        <p className="text-[#666]" style={{ fontSize: "14px" }}>Conteudo nao encontrado</p>
        <Link to={`/content/${contentType}`} className="text-[#888] hover:text-[#fafafa] transition-colors mt-4 inline-block" style={{ fontSize: "13px" }}>
          <ArrowLeft size={14} className="inline mr-1" /> Voltar
        </Link>
      </div>
    );
  }

  const updateField = (field: string, value: any) => {
    setItem((prev: any) => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }));
    setHasChanges(true);
  };

  const buildUniqueSlug = async () => {
    const collection = contentType === "projects" ? "projects" : contentType === "articles" ? "blogPosts" : "pages";
    const localItems =
      collection === "projects" ? data.projects :
      collection === "blogPosts" ? data.blogPosts :
      data.pages || [];

    const baseSlug = slugify(item.slug || item.title || id || "item");
    if (collection === "pages" && isReservedPageSlug(baseSlug)) {
      throw new Error("Este slug e reservado para rotas do sistema.");
    }

    const siblingSlugs = localItems
      .filter((entry) => entry.id !== id)
      .map((entry) => entry.slug)
      .filter(Boolean);

    let candidate = ensureUniqueSlug(baseSlug, siblingSlugs);
    let attempt = 2;

    while (!(await dataProvider.isSlugAvailable(collection, candidate, id))) {
      candidate = `${baseSlug}-${attempt}`;
      attempt += 1;
    }

    return candidate;
  };

  const saveItem = async (silent = false, draft = item) => {
    if (!draft) return;
    try {
      const normalizedSlug = await buildUniqueSlug();
      const nextItem = {
        ...draft,
        slug: normalizedSlug,
        publishedAt: draft.status === "published" ? draft.publishedAt || new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      };

    // Save version before persisting
      const versionLabel = silent ? "Autosave" : "Salvo manualmente";
      if (id) saveVersion(`${contentType}-${id}`, nextItem, versionLabel);

      if (contentType === "projects") {
        updateProjects(data.projects.map((project) => (project.id === id ? nextItem : project)));
      } else if (contentType === "articles") {
        updateBlogPosts(data.blogPosts.map((post) => (post.id === id ? nextItem : post)));
      } else if (contentType === "pages") {
        updatePages((data.pages || []).map((page) => (page.id === id ? nextItem : page)));
      }

      setItem(nextItem);
      setHasChanges(false);
      if (!silent) toast.success("Salvo!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  };

  const publish = () => {
    // Save version as published
    const publishedItem = {
      ...item,
      status: "published" as const,
      publishedAt: new Date().toISOString(),
    };
    if (id) saveVersion(`${contentType}-${id}`, publishedItem, "Publicado");
    setItem(publishedItem);
    setHasChanges(true);
    void saveItem(false, publishedItem);
    toast.success("Publicado!");
  };

  const handleRestoreVersion = (versionData: Record<string, any>) => {
    setItem({ ...versionData, updatedAt: new Date().toISOString() });
    setHasChanges(true);
    toast.success("Versao restaurada! Salve para confirmar.");
  };

  const modeButtons: { key: EditorMode; label: string; icon: typeof PanelLeft }[] = [
    { key: "form", label: "Formulario", icon: PanelLeft },
    { key: "split", label: "Dividido", icon: Columns },
    { key: "visual", label: "Visual", icon: Eye },
  ];

  const [sectionOrder, setSectionOrder] = useState<string[]>(() => readSectionOrder(contentType));

  useEffect(() => {
    setSectionOrder(readSectionOrder(contentType));
  }, [contentType]);

  useEffect(() => {
    writeSectionOrder(contentType, normalizeSectionOrder(sectionOrder, DEFAULT_SECTION_ORDER[contentType]));
  }, [contentType, sectionOrder]);

  const moveSection = useCallback((dragIndex: number, hoverIndex: number) => {
    setSectionOrder((current) => {
      const normalized = normalizeSectionOrder(current, DEFAULT_SECTION_ORDER[contentType]);
      const next = [...normalized];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(hoverIndex, 0, moved);
      return next;
    });
  }, [contentType]);

  const renderSectionList = (sections: EditorSection[]) => {
    const availableKeys = sections.map((section) => section.key);
    const normalizedOrder = normalizeSectionOrder(sectionOrder, availableKeys);
    const sectionMap = new Map(sections.map((section) => [section.key, section]));
    const orderedSections = normalizedOrder
      .map((key) => sectionMap.get(key))
      .filter((section): section is EditorSection => Boolean(section));

    return (
      <div className="space-y-4">
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] px-4 py-3"
          style={{ backgroundColor: "#111", border: "1px solid #1e1e1e" }}
        >
          <div>
            <p className="text-[#ddd]" style={{ fontSize: "13px", lineHeight: "19.5px" }}>
              Estrutura do editor
            </p>
            <p className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16.5px" }}>
              Arraste os paineis para mudar a ordem desta tela.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSectionOrder(DEFAULT_SECTION_ORDER[contentType])}
            className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[#888] transition-colors hover:text-[#fafafa]"
            style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}
          >
            <RotateCcw size={12} />
            Resetar ordem
          </button>
        </div>

        <DndProvider backend={HTML5Backend}>
          <div className="space-y-4">
            {orderedSections.map((section, index) => (
              <DraggableFormSection
                key={section.key}
                section={section}
                index={index}
                moveSection={moveSection}
              />
            ))}
          </div>
        </DndProvider>
      </div>
    );
  };

  // Form for projects
  const renderProjectForm = () => (
    renderSectionList([
      {
        key: "basics",
        title: "Informacoes basicas",
        content: (
          <>
        <Input label="Titulo" value={item.title} onChange={(v) => updateField("title", v)} placeholder="Nome do projeto" />
        <Input label="Subtitulo" value={item.subtitle || ""} onChange={(v) => updateField("subtitle", v)} placeholder="Descricao curta" />
        <div className="grid grid-cols-1 gap-3 min-[1180px]:grid-cols-2">
          <Input label="Slug (URL)" value={item.slug || ""} onChange={(v) => updateField("slug", slugify(v))} placeholder="meu-projeto" />
          <Input label="Categoria" value={item.category} onChange={(v) => updateField("category", v)} placeholder="Web Design" />
        </div>
        <div className="grid grid-cols-1 gap-3 min-[1180px]:grid-cols-2">
          <Input label="Cliente" value={item.client || ""} onChange={(v) => updateField("client", v)} />
          <Input label="Ano" value={item.year || ""} onChange={(v) => updateField("year", v)} />
        </div>
        <Input label="Servicos" value={item.services || ""} onChange={(v) => updateField("services", v)} placeholder="UI Design, Frontend" />
        <Input label="Link externo" value={item.link} onChange={(v) => updateField("link", v)} placeholder="https://..." />
        <TextArea label="Descricao" value={item.description || ""} onChange={(v) => updateField("description", v)} rows={3} />
          </>
        ),
      },
      {
        key: "images",
        title: "Imagens",
        defaultOpen: false,
        content: (
          <>
        <ImageUrlField label="Imagem de capa" value={item.image} onChange={(value) => updateField("image", value)} placeholder="Cole a URL ou envie do computador" />
        {item.image && (
          <ImagePositionEditor
            src={item.image}
            position={item.imagePosition || "50% 50%"}
            onChange={(pos) => updateField("imagePosition", pos)}
            height={300}
            label="Reposicionar imagem de capa (altura fixa 525px no site)"
          />
        )}
        <div className="space-y-1.5">
          <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Cor de fundo das imagens</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={item.imageBgColor || "#000000"}
              onChange={(e) => updateField("imageBgColor", e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-none p-0"
              style={{ backgroundColor: "transparent" }}
              disabled={!item.imageBgColor}
            />
            <input
              type="text"
              value={item.imageBgColor || ""}
              onChange={(e) => updateField("imageBgColor", e.target.value)}
              placeholder="Sem fundo (padrao)"
              className="flex-1 rounded-lg px-3 py-2 text-[#fafafa] placeholder-[#444] focus:outline-none transition-colors"
              style={{ fontSize: "13px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
            />
            {item.imageBgColor && (
              <button
                type="button"
                onClick={() => updateField("imageBgColor", "")}
                className="px-2 py-1.5 rounded-lg cursor-pointer border-none text-[#999] hover:text-[#fafafa] transition-colors"
                style={{ fontSize: "12px", backgroundColor: "#1a1a1a" }}
              >
                Limpar
              </button>
            )}
          </div>
          <p className="text-[#555]" style={{ fontSize: "11px" }}>Deixe vazio para exibir apenas a imagem sem fundo colorido.</p>
        </div>
        <GalleryEditor
          images={item.galleryImages || []}
          onChange={(imgs) => updateField("galleryImages", imgs)}
          positions={item.galleryPositions || []}
          onPositionsChange={(positions) => updateField("galleryPositions", positions)}
        />
          </>
        ),
      },
      {
        key: "content",
        title: "Conteudo",
        content: (
          <>
        <BlockEditor blocks={item.contentBlocks || []} onChange={(blocks) => updateField("contentBlocks", blocks)} />
          </>
        ),
      },
      {
        key: "organization",
        title: "Organizacao",
        defaultOpen: false,
        content: (
          <>
        <TagsInput tags={item.tags || []} onChange={(tags) => updateField("tags", tags)} />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={item.featured || false}
            onChange={(e) => updateField("featured", e.target.checked)}
            className="accent-[#00ff3c]"
          />
          <label className="text-[#aaa]" style={{ fontSize: "13px" }}>Destacar projeto</label>
        </div>
          </>
        ),
      },
      {
        key: "protection",
        title: "Protecao por senha",
        defaultOpen: false,
        content: (
          <>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {item.password ? (
              <Lock size={14} className="text-[#ffa500]" />
            ) : (
              <LockOpen size={14} className="text-[#555]" />
            )}
            <span className="text-[#aaa]" style={{ fontSize: "13px" }}>
              {item.password ? "Projeto protegido por senha" : "Projeto aberto (sem senha)"}
            </span>
          </div>
          <div className="space-y-1.5">
            <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Senha de acesso</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={item.password || ""}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="Deixe vazio para acesso livre"
                className="flex-1 rounded-lg px-3 py-2 text-[#fafafa] placeholder-[#444] focus:outline-none transition-colors"
                style={{ fontSize: "13px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
              />
              {item.password && (
                <button
                  type="button"
                  onClick={() => updateField("password", "")}
                  className="px-2.5 py-1.5 rounded-lg cursor-pointer border-none text-[#999] hover:text-red-400 transition-colors flex items-center gap-1"
                  style={{ fontSize: "12px", backgroundColor: "#1a1a1a" }}
                >
                  <X size={12} /> Remover
                </button>
              )}
            </div>
            <p className="text-[#555]" style={{ fontSize: "11px" }}>
              Visitantes precisarao digitar esta senha para ver o projeto. Ideal para cases sensiveis/NDA.
            </p>
          </div>
        </div>
          </>
        ),
      },
      {
        key: "seo",
        title: "SEO",
        defaultOpen: false,
        content: (
          <>
        <Input label="Titulo SEO" value={item.seoTitle || ""} onChange={(v) => updateField("seoTitle", v)} placeholder="Deixe vazio para usar o titulo" />
        <TextArea label="Descricao SEO" value={item.seoDescription || ""} onChange={(v) => updateField("seoDescription", v)} rows={2} placeholder="Descricao para mecanismos de busca" />
          </>
        ),
      },
    ])
  );

  // Form for articles
  const renderArticleForm = () => (
    renderSectionList([
      {
        key: "basics",
        title: "Informacoes basicas",
        content: (
          <>
        <Input label="Titulo" value={item.title} onChange={(v) => updateField("title", v)} placeholder="Titulo do artigo" />
        <Input label="Subtitulo" value={item.subtitle || ""} onChange={(v) => updateField("subtitle", v)} placeholder="Descricao curta" />
        <div className="grid grid-cols-1 gap-3 min-[1180px]:grid-cols-2">
          <Input label="Slug (URL)" value={item.slug || ""} onChange={(v) => updateField("slug", slugify(v))} placeholder="meu-artigo" />
          <Input label="Publicacao" value={item.publisher || ""} onChange={(v) => updateField("publisher", v)} placeholder="Blog" />
        </div>
        <div className="grid grid-cols-1 gap-3 min-[1180px]:grid-cols-2">
          <Input label="Data" value={item.date} onChange={(v) => updateField("date", v)} />
          <Input label="Tempo de leitura" value={item.readTime || ""} onChange={(v) => updateField("readTime", v)} placeholder="5 min" />
        </div>
        <div className="grid grid-cols-1 gap-3 min-[1180px]:grid-cols-2">
          <Input label="Autor" value={item.author || ""} onChange={(v) => updateField("author", v)} />
          <Input label="Categoria" value={item.category || ""} onChange={(v) => updateField("category", v)} placeholder="Design, Tecnologia..." />
        </div>
        <Input label="Servicos / Topicos" value={item.services || ""} onChange={(v) => updateField("services", v)} placeholder="UX Research, UI Design..." />
        <Input label="Link externo" value={item.link || ""} onChange={(v) => updateField("link", v)} placeholder="https://..." />
        <TextArea label="Descricao" value={item.description || ""} onChange={(v) => updateField("description", v)} rows={3} />
          </>
        ),
      },
      {
        key: "images",
        title: "Imagens",
        defaultOpen: false,
        content: (
          <>
        <ImageUrlField label="Imagem de capa" value={item.image || ""} onChange={(value) => updateField("image", value)} placeholder="Cole a URL ou envie do computador" />
        {item.image && (
          <ImagePositionEditor
            src={item.image}
            position={item.imagePosition || "50% 50%"}
            onChange={(pos) => updateField("imagePosition", pos)}
            height={300}
            label="Reposicionar imagem de capa (altura fixa 525px no site)"
          />
        )}
        <div className="space-y-1.5">
          <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Cor de fundo das imagens</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={item.imageBgColor || "#000000"}
              onChange={(e) => updateField("imageBgColor", e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-none p-0"
              style={{ backgroundColor: "transparent" }}
              disabled={!item.imageBgColor}
            />
            <input
              type="text"
              value={item.imageBgColor || ""}
              onChange={(e) => updateField("imageBgColor", e.target.value)}
              placeholder="Sem fundo (padrao)"
              className="flex-1 rounded-lg px-3 py-2 text-[#fafafa] placeholder-[#444] focus:outline-none transition-colors"
              style={{ fontSize: "13px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
            />
            {item.imageBgColor && (
              <button
                type="button"
                onClick={() => updateField("imageBgColor", "")}
                className="px-2 py-1.5 rounded-lg cursor-pointer border-none text-[#999] hover:text-[#fafafa] transition-colors"
                style={{ fontSize: "12px", backgroundColor: "#1a1a1a" }}
              >
                Limpar
              </button>
            )}
          </div>
          <p className="text-[#555]" style={{ fontSize: "11px" }}>Deixe vazio para exibir apenas a imagem sem fundo colorido.</p>
        </div>
        <GalleryEditor
          images={item.galleryImages || []}
          onChange={(imgs) => updateField("galleryImages", imgs)}
          positions={item.galleryPositions || []}
          onPositionsChange={(positions) => updateField("galleryPositions", positions)}
        />
          </>
        ),
      },
      {
        key: "content",
        title: "Conteudo",
        content: (
          <>
        <BlockEditor blocks={item.contentBlocks || []} onChange={(blocks) => updateField("contentBlocks", blocks)} />
          </>
        ),
      },
      {
        key: "organization",
        title: "Organizacao",
        defaultOpen: false,
        content: (
          <>
        <TagsInput tags={item.tags || []} onChange={(tags) => updateField("tags", tags)} />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={item.featured || false}
            onChange={(e) => updateField("featured", e.target.checked)}
            className="accent-[#00ff3c]"
          />
          <label className="text-[#aaa]" style={{ fontSize: "13px" }}>Destacar artigo</label>
        </div>
          </>
        ),
      },
      {
        key: "protection",
        title: "Protecao por senha",
        defaultOpen: false,
        content: (
          <>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {item.password ? (
              <Lock size={14} className="text-[#ffa500]" />
            ) : (
              <LockOpen size={14} className="text-[#555]" />
            )}
            <span className="text-[#aaa]" style={{ fontSize: "13px" }}>
              {item.password ? "Artigo protegido por senha" : "Artigo aberto (sem senha)"}
            </span>
          </div>
          <div className="space-y-1.5">
            <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Senha de acesso</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={item.password || ""}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="Deixe vazio para acesso livre"
                className="flex-1 rounded-lg px-3 py-2 text-[#fafafa] placeholder-[#444] focus:outline-none transition-colors"
                style={{ fontSize: "13px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
              />
              {item.password && (
                <button
                  type="button"
                  onClick={() => updateField("password", "")}
                  className="px-2.5 py-1.5 rounded-lg cursor-pointer border-none text-[#999] hover:text-red-400 transition-colors flex items-center gap-1"
                  style={{ fontSize: "12px", backgroundColor: "#1a1a1a" }}
                >
                  <X size={12} /> Remover
                </button>
              )}
            </div>
            <p className="text-[#555]" style={{ fontSize: "11px" }}>
              Visitantes precisarao digitar esta senha para ver o artigo. Ideal para conteudo exclusivo.
            </p>
          </div>
        </div>
          </>
        ),
      },
      {
        key: "seo",
        title: "SEO",
        defaultOpen: false,
        content: (
          <>
        <Input label="Titulo SEO" value={item.seoTitle || ""} onChange={(v) => updateField("seoTitle", v)} />
        <TextArea label="Descricao SEO" value={item.seoDescription || ""} onChange={(v) => updateField("seoDescription", v)} rows={2} />
          </>
        ),
      },
    ])
  );

  // Form for pages
  const renderPageForm = () => (
    renderSectionList([
      {
        key: "basics",
        title: "Informacoes basicas",
        content: (
          <>
        <Input label="Titulo" value={item.title} onChange={(v) => updateField("title", v)} placeholder="Titulo da pagina" />
        <Input label="Slug (URL)" value={item.slug || ""} onChange={(v) => updateField("slug", slugify(v))} placeholder="minha-pagina" />
        <TextArea label="Descricao" value={item.description || ""} onChange={(v) => updateField("description", v)} rows={3} />
          </>
        ),
      },
      {
        key: "content",
        title: "Conteudo",
        content: (
          <>
        <BlockEditor blocks={item.contentBlocks || []} onChange={(blocks) => updateField("contentBlocks", blocks)} />
          </>
        ),
      },
      {
        key: "seo",
        title: "SEO",
        defaultOpen: false,
        content: (
          <>
        <Input label="Titulo SEO" value={item.seoTitle || ""} onChange={(v) => updateField("seoTitle", v)} />
        <TextArea label="Descricao SEO" value={item.seoDescription || ""} onChange={(v) => updateField("seoDescription", v)} rows={2} />
          </>
        ),
      },
    ])
  );

  const renderForm = () => {
    if (contentType === "projects") return renderProjectForm();
    if (contentType === "articles") return renderArticleForm();
    return renderPageForm();
  };

  return (
    <div className="-mx-8 -my-8 flex min-h-[calc(100vh-64px)] flex-col">
      {/* Top action bar */}
      <div
        className="sticky top-0 z-20 flex min-h-14 flex-wrap items-center justify-between gap-3 border-b px-6 py-3"
        style={{ backgroundColor: "#0a0a0a", borderColor: "#1e1e1e" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={`/content/${contentType}`}
            className="text-[#666] hover:text-[#aaa] transition-colors flex items-center gap-1"
            style={{ fontSize: "13px" }}
          >
            <ArrowLeft size={14} />
          </Link>
          <div className="w-px h-5" style={{ backgroundColor: "#1e1e1e" }} />
          <span className="text-[#fafafa] truncate max-w-[200px]" style={{ fontSize: "14px" }}>
            {item.title || "Sem titulo"}
          </span>
          {hasChanges && (
            <span className="text-[#ffa500] shrink-0" style={{ fontSize: "11px" }}>
              Alteracoes nao salvas
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* Mode toggle */}
          <div className="hidden items-center gap-1 rounded-[10px] p-0.5 md:flex" style={{ backgroundColor: "#141414" }}>
            {modeButtons.map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`flex h-[24.5px] items-center gap-1.5 rounded-[8px] px-2.5 cursor-pointer transition-colors ${
                  mode === m.key ? "text-[#fafafa] bg-[#1e1e1e]" : "text-[#666] hover:text-[#aaa]"
                }`}
                style={{ fontSize: "11px", lineHeight: "16.5px" }}
                title={m.label}
              >
                <m.icon size={13} />
                <span className="hidden lg:inline">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Preview mode */}
          {(mode === "visual" || mode === "split") && (
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setPreviewMode("desktop")}
                className={`flex h-[26px] w-[26px] items-center justify-center rounded-[4px] cursor-pointer ${previewMode === "desktop" ? "text-[#fafafa]" : "text-[#555]"}`}
              >
                <Monitor size={14} />
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`flex h-[26px] w-[26px] items-center justify-center rounded-[4px] cursor-pointer ${previewMode === "mobile" ? "text-[#fafafa]" : "text-[#555]"}`}
              >
                <Smartphone size={14} />
              </button>
            </div>
          )}

          <div className="w-px h-5" style={{ backgroundColor: "#1e1e1e" }} />

          {/* Status */}
          <StatusSelector status={item.status || "draft"} onChange={(s) => updateField("status", s)} />

          {/* Save draft */}
          <button
            onClick={() => void saveItem()}
            className="flex h-8 items-center gap-1.5 rounded-[10px] px-3 cursor-pointer transition-colors text-[#ccc] hover:text-[#fafafa] hover:bg-[#1a1a1a]"
            style={{ fontSize: "12px", lineHeight: "18px", border: "1px solid #1e1e1e" }}
            title="Salvar (Ctrl+S)"
          >
            <Save size={13} /> Salvar
          </button>

          {/* Version History */}
          <button
            onClick={() => setShowHistory(true)}
            className="flex h-8 items-center gap-1.5 rounded-[10px] px-2.5 cursor-pointer transition-colors text-[#666] hover:text-[#fafafa] hover:bg-[#1a1a1a]"
            style={{ fontSize: "12px", lineHeight: "18px", border: "1px solid #1e1e1e" }}
            title="Historico de versoes (Ctrl+Shift+H)"
          >
            <History size={13} />
            <span className="hidden lg:inline">Historico</span>
          </button>

          {/* Publish */}
          {item.status !== "published" && (
            <button
              onClick={publish}
              className="flex h-[30px] items-center gap-1.5 rounded-[10px] px-3 cursor-pointer transition-colors text-[#111] hover:opacity-90"
              style={{ fontSize: "12px", lineHeight: "18px", backgroundColor: "#00ff3c" }}
            >
              <Send size={13} /> Publicar
            </button>
          )}
        </div>
      </div>

      {/* Editor content */}
      <div className="flex-1 px-6 pb-6 pt-7">
        {mode === "form" && (
          <div className="w-full pt-1">
            {renderForm()}
          </div>
        )}

        {mode === "visual" && (
          <div className="w-full min-w-0 pt-1">
            <VisualPreview item={item} contentType={contentType} onUpdate={updateField} previewMode={previewMode} />
          </div>
        )}

        {mode === "split" && (
          <div
            className="grid w-full gap-4 pt-1 min-[1320px]:grid-cols-[minmax(0,1.12fr)_minmax(0,0.98fr)]"
            style={{ minHeight: "calc(100vh - 160px)" }}
          >
            <div className="min-w-0 overflow-y-auto pr-1 pt-1 min-[1320px]:pr-2" style={{ maxHeight: "calc(100vh - 160px)" }}>
              {renderForm()}
            </div>
            <div className="min-w-0 w-full pt-1 min-[1320px]:max-h-[calc(100vh-160px)]">
              <VisualPreview item={item} contentType={contentType} onUpdate={updateField} previewMode={previewMode} readOnly />
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts bar */}
      <div
        className="hidden items-center justify-center gap-6 border-t px-4 py-2 md:flex"
        style={{ borderTop: "1px solid #141414", backgroundColor: "#0a0a0a" }}
      >
        {[
          { keys: "Ctrl+S", action: "Salvar" },
          { keys: "Ctrl+Z", action: "Desfazer" },
          { keys: "Ctrl+Shift+H", action: "Historico" },
        ].map((shortcut) => (
          <div key={shortcut.keys} className="flex items-center gap-1.5">
            <kbd
              className="inline-flex items-center px-1.5 py-0.5 rounded"
              style={{ fontSize: "10px", backgroundColor: "#1a1a1a", color: "#666", border: "1px solid #242424" }}
            >
              {shortcut.keys}
            </kbd>
            <span className="text-[#444]" style={{ fontSize: "10px" }}>{shortcut.action}</span>
          </div>
        ))}
      </div>

      {/* Version History Panel */}
      {showHistory && id && (
        <VersionHistoryPanel
          contentId={`${contentType}-${id}`}
          currentData={item}
          onRestore={handleRestoreVersion}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
