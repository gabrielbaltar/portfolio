import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Loader2, Move, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { createSquareCroppedImageFile } from "./image-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Slider } from "./ui/slider";

type ProfilePhotoCropDialogProps = {
  file: File | null;
  open: boolean;
  uploading?: boolean;
  onConfirm: (file: File) => Promise<boolean> | boolean;
  onOpenChange: (open: boolean) => void;
};

type ImageSize = {
  width: number;
  height: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const OUTPUT_SIZE = 1080;

function clampValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getCropMetrics(viewportSize: number, imageSize: ImageSize | null, zoom: number) {
  if (!viewportSize || !imageSize) {
    return {
      canDrag: false,
      maxOffsetX: 0,
      maxOffsetY: 0,
      renderedHeight: 0,
      renderedWidth: 0,
    };
  }

  const baseScale = Math.max(viewportSize / imageSize.width, viewportSize / imageSize.height);
  const renderedWidth = imageSize.width * baseScale * zoom;
  const renderedHeight = imageSize.height * baseScale * zoom;
  const maxOffsetX = Math.max(0, (renderedWidth - viewportSize) / 2);
  const maxOffsetY = Math.max(0, (renderedHeight - viewportSize) / 2);

  return {
    canDrag: maxOffsetX > 0 || maxOffsetY > 0,
    maxOffsetX,
    maxOffsetY,
    renderedHeight,
    renderedWidth,
  };
}

function clampOffset(
  offset: { x: number; y: number },
  metrics: ReturnType<typeof getCropMetrics>,
) {
  const nextX = clampValue(offset.x, -metrics.maxOffsetX, metrics.maxOffsetX);
  const nextY = clampValue(offset.y, -metrics.maxOffsetY, metrics.maxOffsetY);

  if (nextX === offset.x && nextY === offset.y) {
    return offset;
  }

  return { x: nextX, y: nextY };
}

function formatImageMeta(file: File, imageSize: ImageSize | null) {
  const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
  if (!imageSize) {
    return `${sizeInMb} MB`;
  }

  return `${imageSize.width} x ${imageSize.height}px - ${sizeInMb} MB`;
}

export function ProfilePhotoCropDialog({
  file,
  open,
  uploading = false,
  onConfirm,
  onOpenChange,
}: ProfilePhotoCropDialogProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);
  const [viewportSize, setViewportSize] = useState(0);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !open) {
      setPreviewUrl(null);
      setImageSize(null);
      setImageError(null);
      setZoom(MIN_ZOOM);
      setOffset({ x: 0, y: 0 });
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    setImageSize(null);
    setImageError(null);
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [file, open]);

  useEffect(() => {
    if (!previewUrl) return;

    let cancelled = false;
    const image = new Image();

    image.onload = () => {
      if (cancelled) return;
      setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
    };

    image.onerror = () => {
      if (cancelled) return;
      setImageError("Nao foi possivel abrir essa imagem.");
    };

    image.src = previewUrl;

    return () => {
      cancelled = true;
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!open) return;

    const node = previewRef.current;
    if (!node) return;

    const updateViewportSize = () => {
      setViewportSize(node.clientWidth);
    };

    updateViewportSize();

    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => updateViewportSize());

    observer?.observe(node);
    window.addEventListener("resize", updateViewportSize);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateViewportSize);
    };
  }, [open]);

  const metrics = getCropMetrics(viewportSize, imageSize, zoom);
  const isBusy = processing || uploading;
  const imageLeft = (viewportSize - metrics.renderedWidth) / 2 + offset.x;
  const imageTop = (viewportSize - metrics.renderedHeight) / 2 + offset.y;

  useEffect(() => {
    setOffset((current) => clampOffset(current, metrics));
  }, [metrics.maxOffsetX, metrics.maxOffsetY]);

  useEffect(() => {
    if (open) return;
    dragStateRef.current = null;
    setDragging(false);
  }, [open]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!metrics.canDrag || isBusy) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    setDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    event.preventDefault();
    setOffset(
      clampOffset(
        {
          x: dragState.originX + (event.clientX - dragState.startX),
          y: dragState.originY + (event.clientY - dragState.startY),
        },
        metrics,
      ),
    );
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStateRef.current = null;
    setDragging(false);
  };

  const resetCrop = () => {
    if (isBusy) return;
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
  };

  const handleSave = async () => {
    if (!file || !imageSize || !viewportSize) return;

    try {
      setProcessing(true);
      const croppedFile = await createSquareCroppedImageFile(file, {
        x: offset.x,
        y: offset.y,
        zoom,
        viewportSize,
        outputSize: OUTPUT_SIZE,
      });
      const shouldClose = await onConfirm(croppedFile);
      if (shouldClose !== false) {
        onOpenChange(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao gerar o recorte da foto.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isBusy) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        className="max-h-[92vh] w-[min(92vw,760px)] max-w-[760px] overflow-y-auto border-[#1f1f1f] bg-[#111111] p-0 text-[#fafafa]"
      >
        <DialogHeader className="border-b border-[#1f1f1f] px-6 py-5">
          <DialogTitle className="text-[#fafafa]" style={{ fontSize: "18px" }}>
            Ajustar foto de perfil
          </DialogTitle>
          <DialogDescription className="text-[#666]" style={{ fontSize: "13px", lineHeight: "20px" }}>
            Arraste a imagem para reposicionar e use o zoom para definir o corte final antes de salvar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 px-6 py-5 md:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-3">
            <div
              ref={previewRef}
              className="relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-[28px] border border-[#252525] bg-[#080808]"
              style={{
                cursor: isBusy ? "default" : dragging ? "grabbing" : metrics.canDrag ? "grab" : "default",
                touchAction: "none",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
            >
              {previewUrl && imageSize && !imageError ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Preview da foto de perfil"
                    className="absolute max-w-none select-none"
                    draggable={false}
                    style={{
                      height: `${metrics.renderedHeight}px`,
                      left: `${imageLeft}px`,
                      top: `${imageTop}px`,
                      width: `${metrics.renderedWidth}px`,
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0">
                    <div
                      className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]"
                      style={{ backgroundSize: "33.33% 33.33%" }}
                    />
                    <div className="absolute inset-x-0 top-1/2 h-px bg-white/12" />
                    <div className="absolute inset-y-0 left-1/2 w-px bg-white/12" />
                    <div className="absolute inset-3 rounded-[24px] border border-white/28 shadow-[0_0_0_999px_rgba(0,0,0,0.35)]" />
                    <div
                      className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/65 px-3 py-1 text-white backdrop-blur-sm"
                      style={{ fontSize: "11px", lineHeight: "16px" }}
                    >
                      <Move size={12} />
                      Arraste para enquadrar
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center px-6 text-center text-[#666]">
                  {imageError ? (
                    <p style={{ fontSize: "13px", lineHeight: "20px" }}>{imageError}</p>
                  ) : (
                    <div className="flex items-center gap-2" style={{ fontSize: "13px" }}>
                      <Loader2 size={16} className="animate-spin" />
                      Preparando preview...
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] px-4 py-3">
              <div>
                <p className="text-[#ddd]" style={{ fontSize: "12px", lineHeight: "18px" }}>
                  Saida final quadrada
                </p>
                <p className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16px" }}>
                  A imagem salva ja vai com o recorte aplicado no arquivo.
                </p>
              </div>
              {file ? (
                <span className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16px" }}>
                  {formatImageMeta(file, imageSize)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="text-[#ddd]" style={{ fontSize: "12px", lineHeight: "18px" }}>
                  Zoom
                </label>
                <span className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16px" }}>
                  {zoom.toFixed(2)}x
                </span>
              </div>
              <Slider
                value={[zoom]}
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.01}
                disabled={isBusy || Boolean(imageError)}
                onValueChange={(values) => {
                  const nextZoom = values[0] ?? MIN_ZOOM;
                  setZoom(nextZoom);
                }}
              />
              <p className="mt-3 text-[#666]" style={{ fontSize: "11px", lineHeight: "16px" }}>
                Aumente o zoom para aproximar e ajustar melhor o enquadramento.
              </p>
            </div>

            <div className="rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-4">
              <p className="mb-2 text-[#ddd]" style={{ fontSize: "12px", lineHeight: "18px" }}>
                Dica
              </p>
              <p className="text-[#666]" style={{ fontSize: "11px", lineHeight: "18px" }}>
                O recorte foi pensado para o avatar do perfil. Posicione rosto e ombros no centro para um resultado melhor.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={!file || !imageSize || !viewportSize || isBusy || Boolean(imageError)}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[#101010] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: "#f5f5f5", fontSize: "12px", fontWeight: 600 }}
              >
                {isBusy ? <Loader2 size={14} className="animate-spin" /> : null}
                {uploading ? "Enviando..." : processing ? "Gerando recorte..." : "Salvar foto"}
              </button>
              <button
                type="button"
                onClick={resetCrop}
                disabled={isBusy}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] px-4 py-2.5 text-[#cfcfcf] transition-colors hover:bg-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ fontSize: "12px" }}
              >
                <RotateCcw size={14} />
                Recentrar
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isBusy}
                className="rounded-xl px-4 py-2.5 text-[#777] transition-colors hover:bg-[#171717] hover:text-[#d5d5d5] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ fontSize: "12px" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
