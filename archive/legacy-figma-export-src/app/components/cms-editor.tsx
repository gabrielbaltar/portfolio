import { BlockEditor } from "./block-editor";
import { toast } from "sonner";
import { VersionHistoryPanel, saveVersion, getVersions } from "./version-history";
import { compressImage } from "./image-utils";
import { ImagePositionEditor, ImagePositionEditorCompact } from "./image-position-editor";
import { VideoPlayer } from "./video-player";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft, Save, Eye, Send, Clock, Undo2, Redo2,
  PanelLeftClose, PanelLeft, Columns, Monitor, Smartphone,
  MoreHorizontal, Star, ChevronDown, ChevronUp, Hash, Globe,
  Trash2, Plus, Upload, X, History, Lock, LockOpen, Video, Code,
} from "lucide-react";
import { useCMS, type ContentBlock, type ContentStatus, type Project, type BlogPost, type Page } from "./cms-data";

// Editor types
type EditorMode = "form" | "visual" | "split";
type ContentType = "projects" | "articles" | "pages";

// Reusable form components
function Input({ label, value, onChange, placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2 text-[#fafafa] placeholder-[#444] focus:outline-none transition-colors"
        style={{ fontSize: "13px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3, placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2 text-[#fafafa] placeholder-[#444] focus:outline-none resize-none transition-colors"
        style={{ fontSize: "13px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors hover:bg-[#1a1a1a]"
        style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}
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

function FormSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl" style={{ backgroundColor: "#111", border: "1px solid #1e1e1e" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#141414] transition-colors rounded-t-xl"
      >
        <span className="text-[#ddd]" style={{ fontSize: "13px" }}>{title}</span>
        {open ? <ChevronUp size={14} className="text-[#555]" /> : <ChevronDown size={14} className="text-[#555]" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-4">{children}</div>}
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

  const handleBlockTextEdit = (index: number, field: string, e: React.FocusEvent<HTMLElement>) => {
    if (readOnly) return;
    const newText = e.currentTarget.textContent || "";
    const blocks = [...(item.contentBlocks || [])];
    if (blocks[index]) {
      blocks[index] = { ...blocks[index], [field]: newText };
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

  const renderBlockText = (
    Tag: keyof React.JSX.IntrinsicElements,
    index: number,
    field: string,
    text: string,
    className: string,
    style: React.CSSProperties
  ) => {
    if (readOnly) {
      const El = Tag as any;
      return <El key={index} className={className} style={style}>{text || <span className="opacity-30">...</span>}</El>;
    }
    const El = Tag as any;
    return (
      <El
        key={index}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e: any) => handleBlockTextEdit(index, field, e)}
        className={`${className} outline-none focus:ring-1 focus:ring-[#333] rounded px-1 -mx-1 cursor-text`}
        style={style}
      >
        {text}
      </El>
    );
  };

  return (
    <div
      className="rounded-xl overflow-hidden h-full flex flex-col"
      style={{ backgroundColor: "#0e0e0e", border: "1px solid #1e1e1e" }}
    >
      {/* Preview toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b shrink-0" style={{ borderColor: "#1e1e1e" }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: readOnly ? "#00ff3c" : "#ffa500" }} />
          <span className="text-[#666]" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
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
              className="px-1.5 py-0.5 rounded-full"
              style={{
                fontSize: "10px",
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
        className="p-6 md:p-8 overflow-y-auto flex-1"
        style={{
          maxWidth: previewMode === "mobile" ? "375px" : "100%",
          margin: previewMode === "mobile" ? "0 auto" : undefined,
        }}
      >
        {/* Cover image */}
        {item.image && (
          <div className="mb-6 rounded-lg overflow-hidden" style={{ backgroundColor: item.imageBgColor || "transparent" }}>
            <img src={item.image} alt={item.title} className="w-full object-cover" style={{ maxHeight: "220px" }} />
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.tags.map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 rounded-md" style={{ fontSize: "11px", backgroundColor: "#1e1e1e", color: "#888" }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        {renderText("h1", "title", item.title, "Titulo do conteudo", "text-[#fafafa] mb-2", { fontSize: "28px", lineHeight: "36px" })}

        {/* Subtitle / Description */}
        {(contentType === "projects" || contentType === "articles") &&
          renderText(
            "p",
            contentType === "projects" ? "subtitle" : "subtitle",
            contentType === "projects" ? item.subtitle : (item.subtitle || item.description),
            "Descricao...",
            "text-[#888] mb-6",
            { fontSize: "15px", lineHeight: "24px" }
          )
        }

        {/* Meta info for projects */}
        {contentType === "projects" && (
          <div className="flex flex-wrap gap-4 mb-6 py-3 border-y" style={{ borderColor: "#1e1e1e", fontSize: "12px", color: "#666" }}>
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
          <div className="flex flex-wrap gap-4 mb-6 py-3 border-y" style={{ borderColor: "#1e1e1e", fontSize: "12px", color: "#666" }}>
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
        <div className="space-y-4">
          {(item.contentBlocks || []).map((block: ContentBlock, i: number) => {
            switch (block.type) {
              case "heading1":
                return renderBlockText("h2", i, "text", block.text, "text-[#fafafa]", { fontSize: "22px", lineHeight: "30px" });
              case "heading2":
                return renderBlockText("h3", i, "text", block.text, "text-[#fafafa]", { fontSize: "18px", lineHeight: "26px" });
              case "heading3":
                return renderBlockText("h4", i, "text", block.text, "text-[#fafafa]", { fontSize: "16px", lineHeight: "24px" });
              case "paragraph":
                return renderBlockText("p", i, "text", block.text, "text-[#999]", { fontSize: "14px", lineHeight: "24px" });
              case "unordered-list":
              case "ordered-list": {
                const ListTag = block.type === "ordered-list" ? "ol" : "ul";
                return (
                  <ListTag key={i} className="pl-5 space-y-1" style={{ listStyleType: block.type === "ordered-list" ? "decimal" : "disc" }}>
                    {block.items.map((listItem: string, j: number) => (
                      <li key={j} className="text-[#999]" style={{ fontSize: "14px", lineHeight: "22px" }}>{listItem}</li>
                    ))}
                  </ListTag>
                );
              }
              case "image":
                return block.url ? (
                  <figure key={i} className="my-4">
                    <img src={block.url} alt={block.caption} className="w-full rounded-lg object-cover max-h-[300px]" />
                    {block.caption && (
                      <figcaption className="text-center mt-2 text-[#666]" style={{ fontSize: "12px" }}>{block.caption}</figcaption>
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
                  <figure key={i} className="my-4">
                    <VideoPlayer
                      src={vBlock.url}
                      poster={vBlock.poster || undefined}
                      autoPlay={vBlock.autoplay || false}
                      loop={vBlock.loop || false}
                      muted={vBlock.muted || vBlock.autoplay || false}
                      height={300}
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
                  <blockquote key={i} className="border-l-2 pl-4 py-2 my-4" style={{ borderColor: "#333" }}>
                    <p className="text-[#ccc] italic" style={{ fontSize: "15px", lineHeight: "24px" }}>{(block as any).text}</p>
                    {(block as any).author && (
                      <cite className="text-[#666] not-italic block mt-2" style={{ fontSize: "12px" }}>— {(block as any).author}</cite>
                    )}
                  </blockquote>
                );
              case "divider":
                return <hr key={i} className="my-6" style={{ borderColor: "#1e1e1e" }} />;
              case "cta":
                return (
                  <div key={i} className="rounded-xl p-6 text-center my-4" style={{ backgroundColor: "#141414", border: "1px solid #1e1e1e" }}>
                    <p className="text-[#ccc] mb-3" style={{ fontSize: "15px" }}>{(block as any).text}</p>
                    <span className="inline-block px-4 py-2 rounded-lg text-[#111] cursor-pointer" style={{ backgroundColor: "#fafafa", fontSize: "13px" }}>
                      {(block as any).buttonText || "Botao"}
                    </span>
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
          <div className="text-center py-12 text-[#444]" style={{ fontSize: "13px" }}>
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

// Gallery Images Editor
function GalleryEditor({ images, onChange, positions, onPositionsChange }: { images: string[]; onChange: (imgs: string[]) => void; positions?: string[]; onPositionsChange?: (positions: string[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (file: File) => {
    compressImage(file)
      .then((dataUrl) => {
        onChange([...images, dataUrl]);
      })
      .catch(() => {
        const reader = new FileReader();
        reader.onload = (e) => {
          onChange([...images, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
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
          onClick={() => fileRef.current?.click()}
          className="rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors hover:bg-[#1a1a1a]"
          style={{ height: "160px", border: "1px dashed #2a2a2a" }}
        >
          <Upload size={14} className="text-[#555]" />
          <span className="text-[#555]" style={{ fontSize: "11px" }}>Upload</span>
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
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
      saveItem(true);
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
        if (item) saveItem(false);
      }
      
      // Ctrl+Z — undo (restore latest version from history)
      if (isMod && e.key === "z" && !e.shiftKey) {
        // Only intercept when not inside a text input/textarea (let browser handle native undo there)
        const target = e.target as HTMLElement;
        const isEditable = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
        if (!isEditable && id) {
          e.preventDefault();
          const versions = getVersions(`${contentType}-${id}`);
          if (versions.length > 0) {
            const latest = versions[0];
            setItem({ ...latest.data, updatedAt: new Date().toISOString() });
            setHasChanges(true);
            toast.success("Desfeito! Estado anterior restaurado.");
          } else {
            toast.info("Nenhuma versao anterior para desfazer.");
          }
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
        <Link to={`/admin/content/${contentType}`} className="text-[#888] hover:text-[#fafafa] transition-colors mt-4 inline-block" style={{ fontSize: "13px" }}>
          <ArrowLeft size={14} className="inline mr-1" /> Voltar
        </Link>
      </div>
    );
  }

  const updateField = (field: string, value: any) => {
    setItem((prev: any) => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }));
    setHasChanges(true);
  };

  const saveItem = (silent = false) => {
    if (!item) return;
    // Save version before persisting
    const versionLabel = silent ? "Autosave" : "Salvo manualmente";
    if (id) saveVersion(`${contentType}-${id}`, item, versionLabel);
    
    if (contentType === "projects") {
      updateProjects(data.projects.map(p => p.id === id ? item : p));
    } else if (contentType === "articles") {
      updateBlogPosts(data.blogPosts.map(b => b.id === id ? item : b));
    } else if (contentType === "pages") {
      updatePages((data.pages || []).map(p => p.id === id ? item : p));
    }
    setHasChanges(false);
    if (!silent) toast.success("Salvo!");
  };

  const publish = () => {
    // Save version as published
    if (id) saveVersion(`${contentType}-${id}`, { ...item, status: "published" }, "Publicado");
    updateField("status", "published");
    setTimeout(() => saveItem(), 50);
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

  // Form for projects
  const renderProjectForm = () => (
    <div className="space-y-4">
      <FormSection title="Informacoes basicas">
        <Input label="Titulo" value={item.title} onChange={(v) => updateField("title", v)} placeholder="Nome do projeto" />
        <Input label="Subtitulo" value={item.subtitle || ""} onChange={(v) => updateField("subtitle", v)} placeholder="Descricao curta" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Slug (URL)" value={item.slug || ""} onChange={(v) => updateField("slug", v)} placeholder="meu-projeto" />
          <Input label="Categoria" value={item.category} onChange={(v) => updateField("category", v)} placeholder="Web Design" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Cliente" value={item.client || ""} onChange={(v) => updateField("client", v)} />
          <Input label="Ano" value={item.year || ""} onChange={(v) => updateField("year", v)} />
        </div>
        <Input label="Servicos" value={item.services || ""} onChange={(v) => updateField("services", v)} placeholder="UI Design, Frontend" />
        <Input label="Link externo" value={item.link} onChange={(v) => updateField("link", v)} placeholder="https://..." />
        <TextArea label="Descricao" value={item.description || ""} onChange={(v) => updateField("description", v)} rows={3} />
      </FormSection>

      <FormSection title="Imagens" defaultOpen={false}>
        <Input label="Imagem de capa" value={item.image} onChange={(v) => updateField("image", v)} placeholder="URL ou upload" />
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
      </FormSection>

      <FormSection title="Conteudo" defaultOpen={true}>
        <BlockEditor blocks={item.contentBlocks || []} onChange={(blocks) => updateField("contentBlocks", blocks)} />
      </FormSection>

      <FormSection title="Organizacao" defaultOpen={false}>
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
      </FormSection>

      <FormSection title="Protecao por senha" defaultOpen={false}>
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
      </FormSection>

      <FormSection title="SEO" defaultOpen={false}>
        <Input label="Titulo SEO" value={item.seoTitle || ""} onChange={(v) => updateField("seoTitle", v)} placeholder="Deixe vazio para usar o titulo" />
        <TextArea label="Descricao SEO" value={item.seoDescription || ""} onChange={(v) => updateField("seoDescription", v)} rows={2} placeholder="Descricao para mecanismos de busca" />
      </FormSection>
    </div>
  );

  // Form for articles
  const renderArticleForm = () => (
    <div className="space-y-4">
      <FormSection title="Informacoes basicas">
        <Input label="Titulo" value={item.title} onChange={(v) => updateField("title", v)} placeholder="Titulo do artigo" />
        <Input label="Subtitulo" value={item.subtitle || ""} onChange={(v) => updateField("subtitle", v)} placeholder="Descricao curta" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Slug (URL)" value={item.slug || ""} onChange={(v) => updateField("slug", v)} placeholder="meu-artigo" />
          <Input label="Publicacao" value={item.publisher || ""} onChange={(v) => updateField("publisher", v)} placeholder="Blog" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Data" value={item.date} onChange={(v) => updateField("date", v)} />
          <Input label="Tempo de leitura" value={item.readTime || ""} onChange={(v) => updateField("readTime", v)} placeholder="5 min" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Autor" value={item.author || ""} onChange={(v) => updateField("author", v)} />
          <Input label="Categoria" value={item.category || ""} onChange={(v) => updateField("category", v)} placeholder="Design, Tecnologia..." />
        </div>
        <Input label="Servicos / Topicos" value={item.services || ""} onChange={(v) => updateField("services", v)} placeholder="UX Research, UI Design..." />
        <Input label="Link externo" value={item.link || ""} onChange={(v) => updateField("link", v)} placeholder="https://..." />
        <TextArea label="Descricao" value={item.description || ""} onChange={(v) => updateField("description", v)} rows={3} />
      </FormSection>

      <FormSection title="Imagens" defaultOpen={false}>
        <Input label="Imagem de capa" value={item.image || ""} onChange={(v) => updateField("image", v)} placeholder="URL da imagem" />
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
      </FormSection>

      <FormSection title="Conteudo" defaultOpen={true}>
        <BlockEditor blocks={item.contentBlocks || []} onChange={(blocks) => updateField("contentBlocks", blocks)} />
      </FormSection>

      <FormSection title="Organizacao" defaultOpen={false}>
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
      </FormSection>

      <FormSection title="Protecao por senha" defaultOpen={false}>
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
      </FormSection>

      <FormSection title="SEO" defaultOpen={false}>
        <Input label="Titulo SEO" value={item.seoTitle || ""} onChange={(v) => updateField("seoTitle", v)} />
        <TextArea label="Descricao SEO" value={item.seoDescription || ""} onChange={(v) => updateField("seoDescription", v)} rows={2} />
      </FormSection>
    </div>
  );

  // Form for pages
  const renderPageForm = () => (
    <div className="space-y-4">
      <FormSection title="Informacoes basicas">
        <Input label="Titulo" value={item.title} onChange={(v) => updateField("title", v)} placeholder="Titulo da pagina" />
        <Input label="Slug (URL)" value={item.slug || ""} onChange={(v) => updateField("slug", v)} placeholder="minha-pagina" />
        <TextArea label="Descricao" value={item.description || ""} onChange={(v) => updateField("description", v)} rows={3} />
      </FormSection>

      <FormSection title="Conteudo" defaultOpen={true}>
        <BlockEditor blocks={item.contentBlocks || []} onChange={(blocks) => updateField("contentBlocks", blocks)} />
      </FormSection>

      <FormSection title="SEO" defaultOpen={false}>
        <Input label="Titulo SEO" value={item.seoTitle || ""} onChange={(v) => updateField("seoTitle", v)} />
        <TextArea label="Descricao SEO" value={item.seoDescription || ""} onChange={(v) => updateField("seoDescription", v)} rows={2} />
      </FormSection>
    </div>
  );

  const renderForm = () => {
    if (contentType === "projects") return renderProjectForm();
    if (contentType === "articles") return renderArticleForm();
    return renderPageForm();
  };

  return (
    <div className="max-w-[1400px] mx-auto -m-4 md:-m-6 lg:-m-8">
      {/* Top action bar */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 h-14 border-b"
        style={{ backgroundColor: "#0e0e0e", borderColor: "#1e1e1e" }}
      >
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/content/${contentType}`}
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

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="hidden md:flex items-center gap-1 rounded-lg p-0.5" style={{ backgroundColor: "#141414" }}>
            {modeButtons.map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                  mode === m.key ? "text-[#fafafa] bg-[#1e1e1e]" : "text-[#666] hover:text-[#aaa]"
                }`}
                style={{ fontSize: "11px" }}
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
                className={`p-1.5 rounded cursor-pointer ${previewMode === "desktop" ? "text-[#fafafa]" : "text-[#555]"}`}
              >
                <Monitor size={14} />
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`p-1.5 rounded cursor-pointer ${previewMode === "mobile" ? "text-[#fafafa]" : "text-[#555]"}`}
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
            onClick={() => saveItem()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-[#ccc] hover:text-[#fafafa] hover:bg-[#1a1a1a]"
            style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}
            title="Salvar (Ctrl+S)"
          >
            <Save size={13} /> Salvar
          </button>

          {/* Version History */}
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-[#666] hover:text-[#fafafa] hover:bg-[#1a1a1a]"
            style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}
            title="Historico de versoes (Ctrl+Shift+H)"
          >
            <History size={13} />
            <span className="hidden lg:inline">Historico</span>
          </button>

          {/* Publish */}
          {item.status !== "published" && (
            <button
              onClick={publish}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-[#111] hover:opacity-90"
              style={{ fontSize: "12px", backgroundColor: "#00ff3c" }}
            >
              <Send size={13} /> Publicar
            </button>
          )}
        </div>
      </div>

      {/* Editor content */}
      <div className="p-4 md:p-6">
        {mode === "form" && (
          <div className="max-w-[700px] mx-auto">
            {renderForm()}
          </div>
        )}

        {mode === "visual" && (
          <VisualPreview item={item} contentType={contentType} onUpdate={updateField} previewMode={previewMode} />
        )}

        {mode === "split" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: "calc(100vh - 180px)" }}>
            <div className="overflow-y-auto pr-2" style={{ maxHeight: "calc(100vh - 140px)" }}>
              {renderForm()}
            </div>
            <div className="hidden lg:block sticky top-14" style={{ maxHeight: "calc(100vh - 140px)" }}>
              <VisualPreview item={item} contentType={contentType} onUpdate={updateField} previewMode={previewMode} readOnly />
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts bar */}
      <div
        className="hidden md:flex items-center justify-center gap-6 px-4 py-2"
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