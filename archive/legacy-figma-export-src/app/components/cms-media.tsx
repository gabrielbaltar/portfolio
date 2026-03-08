import { useState, useRef } from "react";
import { Upload, Trash2, Search, Image, X, Copy, Check, Grid3X3, List } from "lucide-react";
import { useCMS, type MediaItem } from "./cms-data";
import { toast } from "sonner";
import { dataProvider } from "./data-provider";
import { compressImage } from "./image-utils";
import { copyToClipboard } from "./clipboard-utils";

export function CMSMedia() {
  const { data, addMediaItem, removeMediaItem } = useCMS();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const media = (data.media || []).filter((m) =>
    !search.trim() || m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = (files: FileList | File[]) => {
    Array.from(files).forEach(async (file) => {
      if (!file.type.startsWith("image/") && file.type !== "image/svg+xml") return;
      
      // If dataProvider supports direct upload (Supabase Storage), use it
      if (dataProvider.uploadMedia) {
        try {
          const item = await dataProvider.uploadMedia(file);
          addMediaItem(item);
          toast.success(`${file.name} carregado!`);
        } catch (err: any) {
          toast.error(`Erro ao carregar ${file.name}: ${err.message}`);
        }
        return;
      }
      
      // Fallback: base64 localStorage upload
      compressImage(file)
        .then((dataUrl) => {
          const item: MediaItem = {
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            url: dataUrl,
            name: file.name,
            type: file.type,
            size: file.size,
            createdAt: new Date().toISOString(),
          };
          addMediaItem(item);
          toast.success(`${file.name} carregado!`);
        })
        .catch(() => {
          // Fallback to uncompressed
          const reader = new FileReader();
          reader.onload = (e) => {
            const item: MediaItem = {
              id: Date.now().toString() + Math.random().toString(36).slice(2),
              url: e.target?.result as string,
              name: file.name,
              type: file.type,
              size: file.size,
              createdAt: new Date().toISOString(),
            };
            addMediaItem(item);
            toast.success(`${file.name} carregado!`);
          };
          reader.readAsDataURL(file);
        });
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
  };

  const copyUrl = (item: MediaItem) => {
    copyToClipboard(item.url);
    setCopiedId(item.id);
    toast.success("URL copiada!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[#fafafa] mb-1" style={{ fontSize: "22px" }}>
            Biblioteca de Midia
          </h1>
          <p className="text-[#666]" style={{ fontSize: "13px" }}>
            {media.length} {media.length === 1 ? "arquivo" : "arquivos"}
          </p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer transition-colors hover:opacity-90 shrink-0"
          style={{ fontSize: "13px", backgroundColor: "#fafafa" }}
        >
          <Upload size={14} /> Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleUpload(e.target.files);
          }}
        />
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`rounded-xl p-8 mb-6 text-center cursor-pointer transition-all ${
          dragOver ? "scale-[1.01]" : ""
        }`}
        style={{
          backgroundColor: dragOver ? "#1a1a1a" : "#111",
          border: `2px dashed ${dragOver ? "#444" : "#1e1e1e"}`,
        }}
      >
        <Upload size={24} className="mx-auto mb-2 text-[#444]" />
        <p className="text-[#666] mb-1" style={{ fontSize: "13px" }}>
          Arraste arquivos aqui ou clique para selecionar
        </p>
        <p className="text-[#444]" style={{ fontSize: "11px" }}>
          PNG, JPG, GIF, WebP — armazenado em localStorage
        </p>
      </div>

      {/* Search & filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar arquivos..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-[#fafafa] placeholder-[#444] focus:outline-none"
            style={{ fontSize: "13px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded cursor-pointer ${viewMode === "grid" ? "text-[#fafafa] bg-[#1e1e1e]" : "text-[#555]"}`}
          >
            <Grid3X3 size={14} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded cursor-pointer ${viewMode === "list" ? "text-[#fafafa] bg-[#1e1e1e]" : "text-[#555]"}`}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Media grid/list */}
      {media.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: "#141414", border: "1px solid #1e1e1e" }}>
          <Image size={32} className="mx-auto mb-3 text-[#333]" />
          <p className="text-[#666]" style={{ fontSize: "14px" }}>
            {search ? "Nenhum resultado" : "Nenhum arquivo ainda"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {media.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl overflow-hidden cursor-pointer transition-all hover:ring-1 hover:ring-[#333]"
              style={{ backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
              onClick={() => setSelectedImage(item)}
            >
              <div className="relative" style={{ aspectRatio: "1" }}>
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); copyUrl(item); }}
                    className="p-2 rounded-lg bg-black/60 text-white hover:bg-black/80 cursor-pointer backdrop-blur-sm"
                  >
                    {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Remover este arquivo?")) {
                        removeMediaItem(item.id);
                        toast.success("Removido!");
                      }
                    }}
                    className="p-2 rounded-lg bg-black/60 text-red-400 hover:bg-red-500/30 cursor-pointer backdrop-blur-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="px-2.5 py-2">
                <p className="text-[#ccc] truncate" style={{ fontSize: "11px" }}>{item.name}</p>
                <p className="text-[#555]" style={{ fontSize: "10px" }}>{formatSize(item.size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#141414", border: "1px solid #1e1e1e" }}>
          {media.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors group"
              style={{ borderBottom: i < media.length - 1 ? "1px solid #1e1e1e" : undefined }}
            >
              <img src={item.url} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[#ccc] truncate" style={{ fontSize: "13px" }}>{item.name}</p>
                <p className="text-[#555]" style={{ fontSize: "11px" }}>{formatSize(item.size)} — {item.type}</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => copyUrl(item)} className="p-1.5 text-[#666] hover:text-[#aaa] cursor-pointer">
                  {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Remover?")) { removeMediaItem(item.id); toast.success("Removido!"); }
                  }}
                  className="p-1.5 text-[#666] hover:text-red-400 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image detail modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative rounded-xl p-4 max-w-[600px] w-full max-h-[80vh] overflow-auto"
            style={{ backgroundColor: "#141414", border: "1px solid #2a2a2a" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 text-[#666] hover:text-white cursor-pointer z-10"
            >
              <X size={18} />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="w-full rounded-lg object-contain mb-4"
              style={{ maxHeight: "400px" }}
            />
            <div className="space-y-2">
              <p className="text-[#fafafa]" style={{ fontSize: "14px" }}>{selectedImage.name}</p>
              <p className="text-[#666]" style={{ fontSize: "12px" }}>
                {selectedImage.type} — {formatSize(selectedImage.size)}
              </p>
              <button
                onClick={() => copyUrl(selectedImage)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#ccc] hover:text-white transition-colors cursor-pointer"
                style={{ fontSize: "12px", backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
              >
                {copiedId === selectedImage.id ? <Check size={12} /> : <Copy size={12} />}
                Copiar URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}