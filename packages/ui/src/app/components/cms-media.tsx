import { useRef, useState } from "react";
import {
  Check,
  Copy,
  Grid3X3,
  Image,
  List,
  Search,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "./clipboard-utils";
import { useCMS, type MediaItem } from "./cms-data";
import { CMSConfirmDialog } from "./cms-confirm-dialog";
import { dataProvider } from "./data-provider";

function isVideo(item: MediaItem) {
  return item.kind === "video" || item.mimeType.startsWith("video/");
}

export function CMSMedia() {
  const { data, addMediaItem, removeMediaItem } = useCMS();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MediaItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const allMedia = data.media || [];
  const media = allMedia.filter((item) =>
    !search.trim() || item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleUpload = async (files: FileList | File[]) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) continue;
        const item = await dataProvider.uploadMedia(file, "public");
        addMediaItem(item);
        toast.success(`${file.name} carregado com sucesso.`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar arquivo.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length) {
      void handleUpload(event.dataTransfer.files);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    try {
      setDeletingId(item.id);
      await dataProvider.deleteMedia(item);
      removeMediaItem(item.id);
      if (selectedMedia?.id === item.id) {
        setSelectedMedia(null);
      }
      setPendingDelete(null);
      toast.success("Arquivo removido.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover arquivo.");
    } finally {
      setDeletingId(null);
    }
  };

  const copyUrl = (item: MediaItem) => {
    copyToClipboard(item.url);
    setCopiedId(item.id);
    toast.success(item.visibility === "private" ? "Signed URL copiada." : "URL copiada.");
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-[#fafafa]" style={{ fontSize: "22px", lineHeight: "33px" }}>
            Biblioteca de Midia
          </h1>
          <p style={{ fontSize: "13px", lineHeight: "19.5px", color: "#666" }}>
            {allMedia.length} {allMedia.length === 1 ? "arquivo" : "arquivos"}
          </p>
        </div>

        <button
          onClick={() => fileRef.current?.click()}
          className="flex h-[35.5px] shrink-0 items-center gap-2 rounded-[10px] px-4 transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#fafafa", color: "#111", fontSize: "13px", lineHeight: "19.5px" }}
          disabled={uploading}
        >
          <Upload size={14} />
          {uploading ? "Enviando..." : "Upload"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) {
              void handleUpload(event.target.files);
            }
          }}
        />
      </div>

      <button
        type="button"
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className="mb-6 flex h-[140px] w-full flex-col items-center justify-center rounded-[14px] border-2 transition-colors"
        style={{
          backgroundColor: "#111",
          borderColor: dragOver ? "#2f2f2f" : "#1e1e1e",
        }}
      >
        <Upload size={24} className="mb-2 text-[#3a3a3a]" />
        <p style={{ fontSize: "13px", lineHeight: "19.5px", color: "#666" }}>
          Arraste arquivos aqui ou clique para selecionar
        </p>
        <p style={{ fontSize: "11px", lineHeight: "16.5px", color: "#444" }}>
          PNG, JPG, GIF, WebP — armazenado no Supabase Storage
        </p>
      </button>

      <div className="mb-5 flex items-start gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar arquivos..."
            className="h-[37.5px] w-full rounded-[10px] border bg-[#141414] pl-8 pr-3 text-[#fafafa] placeholder-[#ababab] outline-none"
            style={{ borderColor: "#1e1e1e", fontSize: "13px", lineHeight: "19.5px" }}
          />
        </div>

        <div className="flex h-[37.5px] items-start gap-1">
          <button
            onClick={() => setViewMode("grid")}
            className="flex h-[37.5px] w-[30px] items-center justify-center rounded-[4px] transition-colors"
            style={{
              backgroundColor: viewMode === "grid" ? "#1e1e1e" : "transparent",
              color: viewMode === "grid" ? "#fafafa" : "#555",
            }}
          >
            <Grid3X3 size={14} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className="flex h-[37.5px] w-[30px] items-center justify-center rounded-[4px] transition-colors"
            style={{
              backgroundColor: viewMode === "list" ? "#1e1e1e" : "transparent",
              color: viewMode === "list" ? "#fafafa" : "#555",
            }}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {media.length === 0 ? (
        <div
          className="flex h-[163px] flex-col items-center justify-center rounded-[14px] border"
          style={{ backgroundColor: "#141414", borderColor: "#1e1e1e" }}
        >
          <Image size={32} className="mb-3 text-[#333]" />
          <p style={{ fontSize: "14px", lineHeight: "21px", color: "#666" }}>
            {search ? "Nenhum arquivo encontrado" : "Nenhum arquivo ainda"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-3 min-[1280px]:grid-cols-3 min-[1600px]:grid-cols-4 min-[1900px]:grid-cols-5">
          {media.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-[14px] border transition-colors hover:bg-[#171717]"
              style={{ backgroundColor: "#141414", borderColor: "#1e1e1e" }}
            >
              <button
                type="button"
                onClick={() => setSelectedMedia(item)}
                className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-[#101010]"
              >
                {isVideo(item) ? (
                  <video src={item.url} className="h-full w-full object-cover" muted playsInline />
                ) : (
                  <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/45" />
                <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                  {item.visibility === "private" ? "Privado" : "Publico"}
                </div>
              </button>

              <div className="px-3 pb-3 pt-2">
                <div className="truncate text-[#ddd]" style={{ fontSize: "12px", lineHeight: "18px" }}>
                  {item.name}
                </div>
                <div style={{ fontSize: "10px", lineHeight: "15px", color: "#555" }}>
                  {formatSize(item.size)}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => copyUrl(item)}
                    className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#1a1a1a] text-[#888] transition-colors hover:text-[#fafafa]"
                  >
                    {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => setPendingDelete(item)}
                    className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#1a1a1a] text-[#888] transition-colors hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-[14px] border"
          style={{ backgroundColor: "#141414", borderColor: "#1e1e1e" }}
        >
          {media.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 transition-colors hover:bg-[#181818]"
              style={{
                height: index === media.length - 1 ? "60px" : "61px",
                borderBottom: index === media.length - 1 ? undefined : "1px solid #1e1e1e",
              }}
            >
              <button type="button" onClick={() => setSelectedMedia(item)} className="shrink-0">
                {isVideo(item) ? (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-[10px]"
                    style={{ backgroundColor: "#101010" }}
                  >
                    <Video size={14} className="text-[#888]" />
                  </div>
                ) : (
                  <img src={item.url} alt={item.name} className="h-10 w-10 rounded-[10px] object-cover" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[#ddd]" style={{ fontSize: "13px", lineHeight: "19.5px" }}>
                  {item.name}
                </div>
                <div style={{ fontSize: "11px", lineHeight: "16.5px", color: "#555" }}>
                  {formatSize(item.size)} · {item.mimeType}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyUrl(item)}
                  className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-[#fafafa]"
                >
                  {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => setPendingDelete(item)}
                  className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMedia(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative max-h-[80vh] w-full max-w-[600px] overflow-auto rounded-[14px] border p-4"
            style={{ backgroundColor: "#141414", borderColor: "#2a2a2a" }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-[10px] text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-white"
            >
              <X size={18} />
            </button>

            {isVideo(selectedMedia) ? (
              <video src={selectedMedia.url} controls className="mb-4 w-full rounded-[10px]" style={{ maxHeight: "400px" }} />
            ) : (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.name}
                className="mb-4 w-full rounded-[10px] object-contain"
                style={{ maxHeight: "400px" }}
              />
            )}

            <div className="space-y-2">
              <p className="text-[#fafafa]" style={{ fontSize: "14px", lineHeight: "21px" }}>
                {selectedMedia.name}
              </p>
              <p style={{ fontSize: "12px", lineHeight: "18px", color: "#666" }}>
                {selectedMedia.mimeType} · {formatSize(selectedMedia.size)} · {selectedMedia.visibility}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => copyUrl(selectedMedia)}
                  className="flex items-center gap-2 rounded-[10px] border px-3 py-2 text-[#ccc] transition-colors hover:bg-[#1a1a1a] hover:text-white"
                  style={{ backgroundColor: "#181818", borderColor: "#2a2a2a", fontSize: "12px", lineHeight: "18px" }}
                >
                  {copiedId === selectedMedia.id ? <Check size={12} /> : <Copy size={12} />}
                  Copiar URL
                </button>
                <button
                  onClick={() => setPendingDelete(selectedMedia)}
                  className="flex items-center gap-2 rounded-[10px] border px-3 py-2 text-red-300 transition-colors hover:bg-[#1a1a1a] hover:text-red-200"
                  style={{ backgroundColor: "#181818", borderColor: "#2a2a2a", fontSize: "12px", lineHeight: "18px" }}
                >
                  <Trash2 size={12} />
                  Remover
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CMSConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open && !deletingId) setPendingDelete(null);
        }}
        title="Excluir arquivo?"
        description={
          pendingDelete
            ? `Esta acao remove permanentemente "${pendingDelete.name}" da biblioteca de midia.`
            : "Esta acao remove permanentemente este arquivo da biblioteca de midia."
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        busy={!!deletingId}
        onConfirm={() => {
          if (pendingDelete) {
            void handleDelete(pendingDelete);
          }
        }}
      />
    </div>
  );
}
