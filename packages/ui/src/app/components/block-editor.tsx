import { useState, useRef, useCallback, useEffect } from "react";
import { type ContentBlock } from "./cms-data";
import {
  Plus, Trash2, GripVertical, Type, Heading1, Heading2, Heading3,
  List, ListOrdered, ImageIcon, Minus, ChevronUp, ChevronDown,
  Upload, X, Quote, MousePointerClick, Code, Video,
} from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { compressImage } from "./image-utils";

const BLOCK_TYPES: { type: ContentBlock["type"]; label: string; icon: React.ReactNode }[] = [
  { type: "paragraph", label: "Paragrafo", icon: <Type size={14} /> },
  { type: "heading1", label: "Titulo H1", icon: <Heading1 size={14} /> },
  { type: "heading2", label: "Titulo H2", icon: <Heading2 size={14} /> },
  { type: "heading3", label: "Titulo H3", icon: <Heading3 size={14} /> },
  { type: "unordered-list", label: "Lista", icon: <List size={14} /> },
  { type: "ordered-list", label: "Lista numerada", icon: <ListOrdered size={14} /> },
  { type: "image", label: "Imagem", icon: <ImageIcon size={14} /> },
  { type: "video", label: "Video (4K)", icon: <Video size={14} /> },
  { type: "quote", label: "Citacao", icon: <Quote size={14} /> },
  { type: "cta", label: "CTA / Botao", icon: <MousePointerClick size={14} /> },
  { type: "embed", label: "Embed", icon: <Code size={14} /> },
  { type: "divider", label: "Divisor", icon: <Minus size={14} /> },
];

const LABEL_MAP: Record<string, string> = {
  paragraph: "Paragrafo", heading1: "H1", heading2: "H2", heading3: "H3",
  "unordered-list": "Lista", "ordered-list": "Lista numerada",
  image: "Imagem", video: "Video", divider: "Divisor", quote: "Citacao", cta: "CTA", embed: "Embed",
};

const DND_ITEM_TYPE = "CONTENT_BLOCK";

interface DragItem {
  index: number;
  type: string;
}

function createBlock(type: ContentBlock["type"]): ContentBlock {
  switch (type) {
    case "paragraph": return { type: "paragraph", text: "" };
    case "heading1": return { type: "heading1", text: "" };
    case "heading2": return { type: "heading2", text: "" };
    case "heading3": return { type: "heading3", text: "" };
    case "unordered-list": return { type: "unordered-list", items: [""] };
    case "ordered-list": return { type: "ordered-list", items: [""] };
    case "image": return { type: "image", url: "", caption: "" };
    case "video": return { type: "video", url: "", caption: "", poster: "", autoplay: false, loop: false, muted: false };
    case "quote": return { type: "quote", text: "", author: "" };
    case "cta": return { type: "cta", text: "", buttonText: "", buttonUrl: "", openInNewTab: true };
    case "embed": return { type: "embed", url: "", caption: "" };
    case "divider": return { type: "divider" };
  }
}

function BlockTypeSelector({ onSelect }: { onSelect: (type: ContentBlock["type"]) => void }) {
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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#363636] text-[#ababab] hover:text-white hover:border-[#555] transition-colors cursor-pointer"
        style={{ fontSize: "13px" }}
      >
        <Plus size={14} /> Adicionar bloco
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

function ListBlockEditor({ items, onChange, ordered }: { items: string[]; onChange: (items: string[]) => void; ordered: boolean }) {
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[#555] w-5 text-right shrink-0" style={{ fontSize: "13px" }}>
            {ordered ? `${i + 1}.` : "\u2022"}
          </span>
          <input
            value={item}
            onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); const n = [...items]; n.splice(i + 1, 0, ""); onChange(n); }
              if (e.key === "Backspace" && item === "" && items.length > 1) { e.preventDefault(); onChange(items.filter((_, j) => j !== i)); }
            }}
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-[#fafafa] focus:outline-none focus:border-[#555]"
            style={{ fontSize: "14px" }}
            placeholder="Item da lista..."
          />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-[#555] hover:text-red-400 cursor-pointer shrink-0">
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ""])} className="text-[#666] hover:text-[#aaa] flex items-center gap-1 cursor-pointer ml-7" style={{ fontSize: "12px" }}>
        <Plus size={12} /> Adicionar item
      </button>
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
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "image/svg+xml") return;
    setUploading(true);
    compressImage(file)
      .then((dataUrl) => {
        onChange({ ...block, url: dataUrl } as ContentBlock);
        setUploading(false);
      })
      .catch(() => {
        // Fallback to uncompressed if compression fails
        const reader = new FileReader();
        reader.onload = (e) => { onChange({ ...block, url: e.target?.result as string } as ContentBlock); setUploading(false); };
        reader.onerror = () => setUploading(false);
        reader.readAsDataURL(file);
      });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
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
        {block.type === "divider" && <hr className="border-[#363636]" />}

        {(block.type === "paragraph" || block.type === "heading1" || block.type === "heading2" || block.type === "heading3") && (
          <textarea
            value={(block as any).text}
            onChange={(e) => onChange({ ...block, text: e.target.value } as ContentBlock)}
            className="w-full bg-transparent border-none text-[#fafafa] focus:outline-none resize-none"
            style={{ fontSize: fontSizeMap[block.type] || "14px", minHeight: block.type === "paragraph" ? "60px" : "36px" }}
            placeholder={block.type === "heading1" ? "Titulo principal..." : block.type === "heading2" ? "Subtitulo..." : block.type === "heading3" ? "Titulo da secao..." : "Escreva seu texto aqui..."}
          />
        )}

        {(block.type === "unordered-list" || block.type === "ordered-list") && (
          <ListBlockEditor items={(block as any).items} onChange={(items) => onChange({ ...block, items } as ContentBlock)} ordered={block.type === "ordered-list"} />
        )}

        {block.type === "image" && (
          <div className="space-y-2">
            {!(block as any).url ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 px-4 cursor-pointer transition-colors ${dragOver ? "border-[#555] bg-[#1f1f1f]" : "border-[#2a2a2a] bg-[#141414] hover:border-[#444] hover:bg-[#1a1a1a]"}`}
              >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#555] border-t-white rounded-full animate-spin" />
                    <span className="text-[#888]" style={{ fontSize: "13px" }}>Carregando...</span>
                  </div>
                ) : (
                  <>
                    <Upload size={20} className="text-[#555]" />
                    <span className="text-[#888]" style={{ fontSize: "13px" }}>Clique ou arraste uma imagem aqui</span>
                    <span className="text-[#555]" style={{ fontSize: "11px" }}>PNG, JPG, GIF, SVG, WebP</span>
                  </>
                )}
              </div>
            ) : (
              <div className="relative group/img">
                <img src={(block as any).url} alt={(block as any).caption} className="w-full max-h-[240px] rounded-lg object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-colors rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover/img:opacity-100">
                  <button onClick={() => fileInputRef.current?.click()} className="bg-[#222]/80 hover:bg-[#333] text-white rounded-md px-3 py-1.5 cursor-pointer flex items-center gap-1.5 backdrop-blur-sm" style={{ fontSize: "12px" }}>
                    <Upload size={12} /> Trocar
                  </button>
                  <button onClick={() => onChange({ ...block, url: "" } as ContentBlock)} className="bg-[#222]/80 hover:bg-red-500/80 text-white rounded-md px-3 py-1.5 cursor-pointer flex items-center gap-1.5 backdrop-blur-sm" style={{ fontSize: "12px" }}>
                    <X size={12} /> Remover
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} />
              </div>
            )}
            <input
              value={(block as any).caption}
              onChange={(e) => onChange({ ...block, caption: e.target.value } as ContentBlock)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-[#aaa] focus:outline-none focus:border-[#555]"
              style={{ fontSize: "12px" }}
              placeholder="Legenda (opcional)..."
            />
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
        )}

        {block.type === "video" && (() => {
          const vBlock = block as { type: "video"; url: string; caption: string; poster?: string; autoplay?: boolean; loop?: boolean; muted?: boolean };
          const handleVideoFile = (file: File) => {
            if (!file.type.startsWith("video/")) return;
            // Use Object URL for local preview — when Supabase is connected, 
            // this will upload to Storage and return a persistent URL
            const objectUrl = URL.createObjectURL(file);
            onChange({ ...vBlock, url: objectUrl } as ContentBlock);
          };
          return (
            <div className="space-y-3">
              {!vBlock.url ? (
                <>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleVideoFile(f); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 px-4 cursor-pointer transition-colors ${dragOver ? "border-[#555] bg-[#1f1f1f]" : "border-[#2a2a2a] bg-[#141414] hover:border-[#444] hover:bg-[#1a1a1a]"}`}
                  >
                    <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoFile(f); }} />
                    <Video size={24} className="text-[#555]" />
                    <span className="text-[#888]" style={{ fontSize: "13px" }}>Arraste um video ou clique para enviar</span>
                    <span className="text-[#555]" style={{ fontSize: "11px" }}>MP4, WebM, MOV — suporta 4K sem perda de qualidade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#555] shrink-0" style={{ fontSize: "11px" }}>ou</span>
                    <input
                      value=""
                      onChange={(e) => { if (e.target.value) onChange({ ...vBlock, url: e.target.value } as ContentBlock); }}
                      className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-[#fafafa] focus:outline-none focus:border-[#555]"
                      style={{ fontSize: "12px" }}
                      placeholder="Cole a URL do video (Supabase Storage, S3, CDN...)"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="relative group/vid">
                    <video
                      src={vBlock.url}
                      poster={vBlock.poster || undefined}
                      controls
                      className="w-full rounded-lg"
                      style={{ maxHeight: "300px" }}
                    />
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover/vid:opacity-100 transition-opacity">
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
                    <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoFile(f); }} />
                  </div>
                  <input
                    value={vBlock.url}
                    onChange={(e) => onChange({ ...vBlock, url: e.target.value } as ContentBlock)}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-[#aaa] focus:outline-none focus:border-[#555]"
                    style={{ fontSize: "11px" }}
                    placeholder="URL do video"
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
              <input
                value={vBlock.poster || ""}
                onChange={(e) => onChange({ ...vBlock, poster: e.target.value } as ContentBlock)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-[#aaa] focus:outline-none focus:border-[#555]"
                style={{ fontSize: "12px" }}
                placeholder="URL do poster/thumbnail (opcional)"
              />
              <input
                value={vBlock.caption}
                onChange={(e) => onChange({ ...vBlock, caption: e.target.value } as ContentBlock)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-[#aaa] focus:outline-none focus:border-[#555]"
                style={{ fontSize: "12px" }}
                placeholder="Legenda (opcional)..."
              />
              <p className="text-[#444] px-1" style={{ fontSize: "10px" }}>
                Para videos 4K, recomenda-se hospedar no Supabase Storage ou CDN externo e colar a URL acima.
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
            <textarea
              value={(block as any).text}
              onChange={(e) => onChange({ ...block, text: e.target.value } as ContentBlock)}
              className="w-full bg-transparent border-none text-[#fafafa] focus:outline-none resize-none italic"
              style={{ fontSize: "14px", minHeight: "60px" }}
              placeholder="Texto da citacao..."
            />
            <input
              value={(block as any).author}
              onChange={(e) => onChange({ ...block, author: e.target.value } as ContentBlock)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-[#aaa] focus:outline-none focus:border-[#555]"
              style={{ fontSize: "12px" }}
              placeholder="Autor (opcional)..."
            />
          </div>
        )}

        {block.type === "cta" && (
          <div className="space-y-2">
            <textarea
              value={(block as any).text}
              onChange={(e) => onChange({ ...block, text: e.target.value } as ContentBlock)}
              className="w-full bg-transparent border-none text-[#fafafa] focus:outline-none resize-none"
              style={{ fontSize: "14px", minHeight: "40px" }}
              placeholder="Texto do CTA..."
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={(block as any).buttonText}
                onChange={(e) => onChange({ ...block, buttonText: e.target.value } as ContentBlock)}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-[#aaa] focus:outline-none focus:border-[#555]"
                style={{ fontSize: "12px" }}
                placeholder="Texto do botao..."
              />
              <input
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

        {block.type === "embed" && (
          <div className="space-y-2">
            <input
              value={(block as any).url}
              onChange={(e) => onChange({ ...block, url: e.target.value } as ContentBlock)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-[#fafafa] focus:outline-none focus:border-[#555]"
              style={{ fontSize: "13px" }}
              placeholder="URL do embed (YouTube, Vimeo, etc)..."
            />
            <input
              value={(block as any).caption}
              onChange={(e) => onChange({ ...block, caption: e.target.value } as ContentBlock)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-[#aaa] focus:outline-none focus:border-[#555]"
              style={{ fontSize: "12px" }}
              placeholder="Legenda (opcional)..."
            />
          </div>
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
          <DraggableBlock
            key={`block-${i}-${block.type}`}
            block={block}
            index={i}
            total={blocks.length}
            onChange={(b) => updateBlock(i, b)}
            onRemove={() => removeBlock(i)}
            onMove={(dir) => moveBlockByButton(i, dir)}
            moveBlock={moveBlockByDrag}
          />
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