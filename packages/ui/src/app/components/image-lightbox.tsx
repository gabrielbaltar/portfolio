import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export interface LightboxOriginRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ImageLightboxProps {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
  originRect?: LightboxOriginRect | null;
}

function clampOriginRect(rect: LightboxOriginRect, viewportWidth: number, viewportHeight: number): LightboxOriginRect {
  const left = Math.max(0, Math.min(rect.left, Math.max(0, viewportWidth - 1)));
  const top = Math.max(0, Math.min(rect.top, Math.max(0, viewportHeight - 1)));
  const width = Math.max(1, Math.min(rect.width, Math.max(1, viewportWidth - left)));
  const height = Math.max(1, Math.min(rect.height, Math.max(1, viewportHeight - top)));

  return { top, left, width, height };
}

function fitRectToViewport(aspectRatio: number, viewportWidth: number, viewportHeight: number): LightboxOriginRect {
  const horizontalPadding = viewportWidth >= 768 ? 64 : 20;
  const verticalPadding = viewportWidth >= 768 ? 48 : 20;
  const maxWidth = Math.max(220, viewportWidth - horizontalPadding * 2);
  const maxHeight = Math.max(220, viewportHeight - verticalPadding * 2);

  let width = maxWidth;
  let height = width / aspectRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    top: (viewportHeight - height) / 2,
    left: (viewportWidth - width) / 2,
    width,
    height,
  };
}

export function getLightboxOriginRect(target: EventTarget | null): LightboxOriginRect | null {
  if (!(target instanceof Element)) return null;

  const rect = target.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

export function ImageLightbox({ open, src, alt, onClose, originRect = null }: ImageLightboxProps) {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 800 : window.innerHeight,
  }));
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, [open]);

  useEffect(() => {
    if (!open) setImageAspectRatio(null);
  }, [open, src]);

  const resolvedAspectRatio = imageAspectRatio
    || (originRect && originRect.width > 0 && originRect.height > 0 ? originRect.width / originRect.height : null)
    || 1.4;

  const targetRect = useMemo(
    () => fitRectToViewport(resolvedAspectRatio, viewport.width, viewport.height),
    [resolvedAspectRatio, viewport.height, viewport.width],
  );

  const startRect = useMemo(() => {
    if (originRect) return clampOriginRect(originRect, viewport.width, viewport.height);

    return {
      top: targetRect.top + 18,
      left: targetRect.left,
      width: targetRect.width,
      height: targetRect.height,
    };
  }, [originRect, targetRect.height, targetRect.left, targetRect.top, targetRect.width, viewport.height, viewport.width]);

  const startRadius = Math.max(18, Math.min(30, Math.min(startRect.width, startRect.height) * 0.08));
  const endRadius = Math.max(24, Math.min(36, Math.min(targetRect.width, targetRect.height) * 0.05));

  return (
    <AnimatePresence>
      {open && src ? (
        <motion.div
          key="lightbox-overlay"
          className="fixed inset-0 z-[120] overflow-hidden backdrop-blur-sm"
          style={{ backgroundColor: "rgba(20, 20, 22, 0.62)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          onContextMenu={(event) => event.preventDefault()}
          role="dialog"
          aria-modal="true"
          aria-label={alt || "Imagem ampliada"}
        >
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />

          <motion.button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            className="absolute right-4 top-4 z-[122] flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors cursor-pointer md:right-6 md:top-6"
            style={{
              border: "1px solid rgba(255,255,255,0.14)",
              backgroundColor: "rgba(70, 70, 74, 0.48)",
              backdropFilter: "blur(14px)",
              willChange: "transform, opacity",
            }}
            initial={{ opacity: 0, scale: 0.94, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.22, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Fechar imagem"
          >
            <X size={18} />
          </motion.button>

          <div className="pointer-events-none fixed inset-0 z-[121]">
            <motion.div
              className="pointer-events-auto absolute overflow-hidden"
              initial={{
                top: startRect.top,
                left: startRect.left,
                width: startRect.width,
                height: startRect.height,
                borderRadius: startRadius,
                boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
              }}
              animate={{
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
                borderRadius: endRadius,
                boxShadow: "0 38px 120px rgba(0,0,0,0.38)",
              }}
              exit={{
                top: startRect.top,
                left: startRect.left,
                width: startRect.width,
                height: startRect.height,
                borderRadius: startRadius,
                boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
              }}
              transition={{
                type: "spring",
                stiffness: 340,
                damping: 34,
                mass: 0.9,
              }}
              style={{ willChange: "top, left, width, height, border-radius, box-shadow" }}
              onClick={(event) => event.stopPropagation()}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)",
                }}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.45 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              />

              <motion.img
                src={src}
                alt={alt}
                className="h-full w-full select-none object-contain"
                style={{
                  WebkitTouchCallout: "none",
                  userSelect: "none",
                  transform: "translateZ(0)",
                }}
                initial={{ scale: 1.06, opacity: 0.9, filter: "blur(10px)" }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                exit={{ scale: 1.03, opacity: 0.96, filter: "blur(2px)" }}
                transition={{
                  scale: { type: "spring", stiffness: 300, damping: 30, mass: 0.86 },
                  opacity: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
                  filter: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                }}
                onLoad={(event) => {
                  const { naturalWidth, naturalHeight } = event.currentTarget;
                  if (!naturalWidth || !naturalHeight) return;
                  setImageAspectRatio(naturalWidth / naturalHeight);
                }}
                onContextMenu={(event) => event.preventDefault()}
                onDragStart={(event) => event.preventDefault()}
              />
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
