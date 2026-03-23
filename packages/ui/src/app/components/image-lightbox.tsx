import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export interface LightboxOriginRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface LightboxSlide {
  src: string;
  alt: string;
  originRect?: LightboxOriginRect | null;
}

export interface LightboxOpenPayload {
  slides: LightboxSlide[];
  index?: number;
}

interface ImageLightboxProps {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
  originRect?: LightboxOriginRect | null;
  slides?: LightboxSlide[];
  initialIndex?: number;
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

function fitImageToFrame(aspectRatio: number, frameWidth: number, frameHeight: number) {
  let width = frameWidth;
  let height = width / aspectRatio;

  if (height > frameHeight) {
    height = frameHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
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

export function ImageLightbox({
  open,
  src,
  alt,
  onClose,
  originRect = null,
  slides,
  initialIndex = 0,
}: ImageLightboxProps) {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 800 : window.innerHeight,
  }));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<1 | 2>(1);
  const [imageAspectRatios, setImageAspectRatios] = useState<Record<string, number>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const normalizedSlides = useMemo(() => {
    const fromGallery = (slides || []).filter((slide) => slide.src.trim() !== "");
    if (fromGallery.length > 0) return fromGallery;
    if (!src) return [];
    return [{ src, alt, originRect }];
  }, [alt, originRect, slides, src]);

  const hasMultipleSlides = normalizedSlides.length > 1;
  const safeIndex = Math.max(0, Math.min(currentIndex, Math.max(0, normalizedSlides.length - 1)));
  const activeSlide = normalizedSlides[safeIndex] || null;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.body.style.overflow = "hidden";
    document.documentElement.style.scrollBehavior = "auto";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (normalizedSlides.length <= 1) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setSlideDirection(1);
        setCurrentIndex((current) => (current + 1) % normalizedSlides.length);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSlideDirection(-1);
        setCurrentIndex((current) => (current - 1 + normalizedSlides.length) % normalizedSlides.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [normalizedSlides.length, onClose, open]);

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
    if (!open) return;

    const boundedIndex = Math.max(0, Math.min(initialIndex, Math.max(0, normalizedSlides.length - 1)));
    setCurrentIndex(boundedIndex);
    setSlideDirection(0);
    setZoomLevel(1);
  }, [initialIndex, normalizedSlides, open]);

  useEffect(() => {
    if (!open) return;
    setZoomLevel(1);
  }, [open, safeIndex]);

  useEffect(() => {
    if (!open) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const frameId = window.requestAnimationFrame(() => {
      container.scrollLeft = Math.max(0, (container.scrollWidth - container.clientWidth) / 2);
      container.scrollTop = Math.max(0, (container.scrollHeight - container.clientHeight) / 2);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [open, safeIndex, zoomLevel]);

  const resolvedAspectRatio = activeSlide
    ? imageAspectRatios[activeSlide.src]
      || (activeSlide.originRect && activeSlide.originRect.width > 0 && activeSlide.originRect.height > 0
        ? activeSlide.originRect.width / activeSlide.originRect.height
        : null)
      || 1.4
    : 1.4;

  const targetRect = useMemo(
    () => fitRectToViewport(viewport.width, viewport.height),
    [viewport.height, viewport.width],
  );

  const startRect = useMemo(() => {
    if (activeSlide?.originRect) return clampOriginRect(activeSlide.originRect, viewport.width, viewport.height);

    return {
      top: targetRect.top + 12,
      left: targetRect.left + 12,
      width: Math.max(1, targetRect.width - 24),
      height: Math.max(1, targetRect.height - 24),
    };
  }, [activeSlide?.originRect, targetRect.height, targetRect.left, targetRect.top, targetRect.width, viewport.height, viewport.width]);

  const fittedImageSize = useMemo(
    () => fitImageToFrame(resolvedAspectRatio, targetRect.width, targetRect.height),
    [resolvedAspectRatio, targetRect.height, targetRect.width],
  );

  const renderedImageWidth = fittedImageSize.width * zoomLevel;
  const renderedImageHeight = fittedImageSize.height * zoomLevel;
  const startRadius = Math.max(18, Math.min(30, Math.min(startRect.width, startRect.height) * 0.08));
  const endRadius = Math.max(22, Math.min(30, Math.min(targetRect.width, targetRect.height) * 0.03));

  const goToPrevious = () => {
    if (!hasMultipleSlides) return;
    setSlideDirection(-1);
    setCurrentIndex((current) => (current - 1 + normalizedSlides.length) % normalizedSlides.length);
  };

  const goToNext = () => {
    if (!hasMultipleSlides) return;
    setSlideDirection(1);
    setCurrentIndex((current) => (current + 1) % normalizedSlides.length);
  };

  if (!activeSlide) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="lightbox-overlay"
          className="fixed inset-0 z-[120] overflow-hidden backdrop-blur-sm"
          style={{ backgroundColor: "rgba(16, 16, 18, 0.74)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => onClose()}
          onContextMenu={(event) => event.preventDefault()}
          role="dialog"
          aria-modal="true"
          aria-label={activeSlide.alt || "Imagem ampliada"}
        >
          <div className="absolute right-4 top-4 z-[123] flex items-center gap-2 md:right-6 md:top-6">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setZoomLevel((current) => (current === 1 ? 2 : 1));
              }}
              className="flex h-10 min-w-[52px] cursor-pointer items-center justify-center rounded-full px-3 text-white transition-colors"
              style={{
                border: "1px solid rgba(255,255,255,0.14)",
                backgroundColor: "rgba(70, 70, 74, 0.48)",
                backdropFilter: "blur(14px)",
              }}
              aria-label={zoomLevel === 1 ? "Ativar zoom 2x" : "Voltar para zoom 1x"}
            >
              <span className="flex items-center gap-1.5" style={{ fontSize: "12px", lineHeight: "16px" }}>
                <Search size={14} />
                {zoomLevel}x
              </span>
            </button>
            <motion.button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClose();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors cursor-pointer"
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
          </div>

          {hasMultipleSlides && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 z-[123] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition-colors cursor-pointer md:left-6"
                style={{
                  border: "1px solid rgba(255,255,255,0.14)",
                  backgroundColor: "rgba(70, 70, 74, 0.48)",
                  backdropFilter: "blur(14px)",
                }}
                aria-label="Mostrar imagem anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 z-[123] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition-colors cursor-pointer md:right-6"
                style={{
                  border: "1px solid rgba(255,255,255,0.14)",
                  backgroundColor: "rgba(70, 70, 74, 0.48)",
                  backdropFilter: "blur(14px)",
                }}
                aria-label="Mostrar proxima imagem"
              >
                <ChevronRight size={18} />
              </button>
              <div
                className="absolute bottom-4 left-1/2 z-[123] -translate-x-1/2 rounded-full px-3 py-1.5 text-white md:bottom-6"
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  backgroundColor: "rgba(18, 18, 20, 0.54)",
                  backdropFilter: "blur(14px)",
                  fontSize: "12px",
                  lineHeight: "16px",
                }}
                onClick={(event) => event.stopPropagation()}
              >
                {safeIndex + 1} / {normalizedSlides.length}
              </div>
            </>
          )}

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
              style={{
                willChange: "top, left, width, height, border-radius, box-shadow",
                backgroundColor: "rgba(10, 10, 12, 0.82)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                ref={scrollContainerRef}
                className="image-lightbox-scroll absolute inset-0 overflow-auto"
                style={{ overscrollBehavior: "contain" }}
              >
                <div className="flex min-h-full min-w-full items-center justify-center p-4 md:p-6">
                  <AnimatePresence initial={false} mode="wait" custom={slideDirection}>
                    <motion.div
                      key={activeSlide.src}
                      custom={slideDirection}
                      className="relative shrink-0"
                      style={{ width: `${renderedImageWidth}px`, height: `${renderedImageHeight}px` }}
                      initial={{ opacity: 0, x: slideDirection === 0 ? 0 : slideDirection > 0 ? 28 : -28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: slideDirection > 0 ? -20 : 20 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <img
                        src={activeSlide.src}
                        alt={activeSlide.alt}
                        className="h-full w-full select-none object-contain"
                        style={{
                          WebkitTouchCallout: "none",
                          userSelect: "none",
                          transform: "translateZ(0)",
                        }}
                        onLoad={(event) => {
                          const { naturalWidth, naturalHeight } = event.currentTarget;
                          if (!naturalWidth || !naturalHeight) return;
                          setImageAspectRatios((current) => ({
                            ...current,
                            [activeSlide.src]: naturalWidth / naturalHeight,
                          }));
                        }}
                        onContextMenu={(event) => event.preventDefault()}
                        onDragStart={(event) => event.preventDefault()}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
