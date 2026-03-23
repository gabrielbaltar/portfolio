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

function fitRectToViewport(viewportWidth: number, viewportHeight: number): LightboxOriginRect {
  const horizontalPadding = viewportWidth >= 768 ? 56 : 16;
  const verticalPadding = viewportWidth >= 768 ? 40 : 16;
  const width = Math.max(220, viewportWidth - horizontalPadding * 2);
  const height = Math.max(220, viewportHeight - verticalPadding * 2);

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
    if (!open) return undefined;

    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";

    return () => {
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    };
  }, [open]);

  const targetRect = useMemo(
    () => fitRectToViewport(viewport.width, viewport.height),
    [viewport.height, viewport.width],
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
  const endRadius = Math.max(22, Math.min(30, Math.min(targetRect.width, targetRect.height) * 0.03));

  return (
    <AnimatePresence>
      {open && src ? (
        <motion.div
          key="lightbox-overlay"
          className="fixed inset-0 z-[120] overflow-hidden backdrop-blur-sm"
          style={{ backgroundColor: "rgba(16, 16, 18, 0.74)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          onContextMenu={(event) => event.preventDefault()}
          role="dialog"
          aria-modal="true"
          aria-label={alt || "Imagem ampliada"}
        >
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
            initial={{ opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
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
                boxShadow: "0 10px 32px rgba(0,0,0,0.16)",
              }}
              animate={{
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
                borderRadius: endRadius,
                boxShadow: "0 30px 90px rgba(0,0,0,0.34)",
              }}
              exit={{
                top: startRect.top,
                left: startRect.left,
                width: startRect.width,
                height: startRect.height,
                borderRadius: startRadius,
                boxShadow: "0 10px 32px rgba(0,0,0,0.16)",
              }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ willChange: "top, left, width, height, border-radius, box-shadow" }}
              onClick={(event) => event.stopPropagation()}
            >
              <motion.img
                src={src}
                alt={alt}
                className="h-full w-full select-none object-contain"
                style={{
                  WebkitTouchCallout: "none",
                  userSelect: "none",
                  transform: "translateZ(0)",
                  backgroundColor: "rgba(10, 10, 12, 0.82)",
                }}
                initial={{ opacity: 0.94 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.94 }}
                transition={{
                  opacity: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
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
