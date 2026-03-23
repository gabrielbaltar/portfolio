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

function clampValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampOriginRect(rect: LightboxOriginRect, viewportWidth: number, viewportHeight: number): LightboxOriginRect {
  const left = clampValue(rect.left, 0, Math.max(0, viewportWidth - 1));
  const top = clampValue(rect.top, 0, Math.max(0, viewportHeight - 1));
  const width = clampValue(rect.width, 1, Math.max(1, viewportWidth - left));
  const height = clampValue(rect.height, 1, Math.max(1, viewportHeight - top));

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

function buildFrameTransform(fromRect: LightboxOriginRect, toRect: LightboxOriginRect) {
  return {
    x: fromRect.left - toRect.left,
    y: fromRect.top - toRect.top,
    scaleX: Math.max(0.01, fromRect.width / Math.max(1, toRect.width)),
    scaleY: Math.max(0.01, fromRect.height / Math.max(1, toRect.height)),
  };
}

function centerRectWithinFrame(frame: LightboxOriginRect, contentWidth: number, contentHeight: number): LightboxOriginRect {
  return {
    top: frame.top + (frame.height - contentHeight) / 2,
    left: frame.left + (frame.width - contentWidth) / 2,
    width: contentWidth,
    height: contentHeight,
  };
}

function clampPanOffset(
  offset: { x: number; y: number },
  maxPanX: number,
  maxPanY: number,
) {
  return {
    x: clampValue(offset.x, -maxPanX, maxPanX),
    y: clampValue(offset.y, -maxPanY, maxPanY),
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
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);

  const normalizedSlides = useMemo(() => {
    const fromGallery = (slides || []).filter((slide) => slide.src.trim() !== "");
    if (fromGallery.length > 0) return fromGallery;
    if (!src) return [];
    return [{ src, alt, originRect }];
  }, [alt, originRect, slides, src]);

  const hasMultipleSlides = normalizedSlides.length > 1;
  const safeIndex = Math.max(0, Math.min(currentIndex, Math.max(0, normalizedSlides.length - 1)));
  const activeSlide = normalizedSlides[safeIndex] || null;

  const closeLightbox = () => {
    dragStateRef.current = null;
    setIsDragging(false);
    setSlideDirection(0);
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.body.style.overflow = "hidden";
    document.documentElement.style.scrollBehavior = "auto";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
        return;
      }

      if (normalizedSlides.length <= 1) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setPanOffset({ x: 0, y: 0 });
        setSlideDirection(1);
        setCurrentIndex((current) => (current + 1) % normalizedSlides.length);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPanOffset({ x: 0, y: 0 });
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
    setPanOffset({ x: 0, y: 0 });
  }, [initialIndex, normalizedSlides, open]);

  useEffect(() => {
    if (!open) return;

    dragStateRef.current = null;
    setIsDragging(false);
    setPanOffset({ x: 0, y: 0 });
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

  const fittedImageSize = useMemo(
    () => fitImageToFrame(resolvedAspectRatio, targetRect.width, targetRect.height),
    [resolvedAspectRatio, targetRect.height, targetRect.width],
  );

  const imageTargetRect = useMemo(
    () => centerRectWithinFrame(targetRect, fittedImageSize.width, fittedImageSize.height),
    [fittedImageSize.height, fittedImageSize.width, targetRect],
  );

  const startRect = useMemo(() => {
    if (activeSlide?.originRect) return clampOriginRect(activeSlide.originRect, viewport.width, viewport.height);

    return {
      top: imageTargetRect.top + 10,
      left: imageTargetRect.left + 10,
      width: Math.max(1, imageTargetRect.width - 20),
      height: Math.max(1, imageTargetRect.height - 20),
    };
  }, [activeSlide?.originRect, imageTargetRect, viewport.height, viewport.width]);

  const renderedImageWidth = fittedImageSize.width * zoomLevel;
  const renderedImageHeight = fittedImageSize.height * zoomLevel;
  const maxPanX = Math.max(0, (renderedImageWidth - targetRect.width) / 2);
  const maxPanY = Math.max(0, (renderedImageHeight - targetRect.height) / 2);
  const isPannable = maxPanX > 0.5 || maxPanY > 0.5;
  const startRadius = Math.max(16, Math.min(28, Math.min(startRect.width, startRect.height) * 0.08));
  const endRadius = Math.max(20, Math.min(28, Math.min(imageTargetRect.width, imageTargetRect.height) * 0.03));
  const initialImageTransform = buildFrameTransform(startRect, imageTargetRect);

  useEffect(() => {
    if (!open) return;
    setPanOffset((current) => clampPanOffset(current, maxPanX, maxPanY));
  }, [maxPanX, maxPanY, open]);

  const goToPrevious = () => {
    if (!hasMultipleSlides) return;
    dragStateRef.current = null;
    setIsDragging(false);
    setPanOffset({ x: 0, y: 0 });
    setSlideDirection(-1);
    setCurrentIndex((current) => (current - 1 + normalizedSlides.length) % normalizedSlides.length);
  };

  const goToNext = () => {
    if (!hasMultipleSlides) return;
    dragStateRef.current = null;
    setIsDragging(false);
    setPanOffset({ x: 0, y: 0 });
    setSlideDirection(1);
    setCurrentIndex((current) => (current + 1) % normalizedSlides.length);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isPannable) return;

    event.preventDefault();
    event.stopPropagation();

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: panOffset.x,
      panY: panOffset.y,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    event.preventDefault();
    event.stopPropagation();

    setPanOffset(
      clampPanOffset(
        {
          x: dragState.panX + (event.clientX - dragState.startX),
          y: dragState.panY + (event.clientY - dragState.startY),
        },
        maxPanX,
        maxPanY,
      ),
    );
  };

  const finishPointerInteraction = (event?: React.PointerEvent<HTMLDivElement>) => {
    if (event && dragStateRef.current && dragStateRef.current.pointerId === event.pointerId && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStateRef.current = null;
    setIsDragging(false);
  };

  if (!activeSlide) return null;

  const imageEnterState = slideDirection === 0
    ? {
        opacity: activeSlide.originRect ? 0.76 : 0,
        x: activeSlide.originRect ? initialImageTransform.x : 0,
        y: activeSlide.originRect ? initialImageTransform.y : 12,
        scaleX: activeSlide.originRect ? initialImageTransform.scaleX : 0.985,
        scaleY: activeSlide.originRect ? initialImageTransform.scaleY : 0.985,
        borderRadius: activeSlide.originRect ? startRadius : endRadius + 4,
      }
    : {
        opacity: 0,
        x: slideDirection > 0 ? 56 : -56,
        y: 0,
        scaleX: 0.985,
        scaleY: 0.985,
        borderRadius: endRadius,
      };

  const imageExitState = slideDirection === 0 && activeSlide.originRect
    ? {
        opacity: 0.82,
        x: initialImageTransform.x,
        y: initialImageTransform.y,
        scaleX: initialImageTransform.scaleX,
        scaleY: initialImageTransform.scaleY,
        borderRadius: startRadius,
      }
    : slideDirection === 0
      ? {
          opacity: 0,
          x: 0,
          y: 10,
          scaleX: 0.985,
          scaleY: 0.985,
          borderRadius: endRadius + 4,
        }
      : {
          opacity: 0,
          x: slideDirection > 0 ? -44 : 44,
          y: 0,
          scaleX: 0.985,
          scaleY: 0.985,
          borderRadius: endRadius,
        };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="lightbox-overlay"
          className="fixed inset-0 z-[120] overflow-hidden"
          style={{ backgroundColor: "rgba(10, 10, 12, 0.8)", backdropFilter: "blur(8px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={closeLightbox}
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
              className="flex h-10 min-w-[52px] items-center justify-center rounded-full px-3 text-white transition-colors"
              style={{
                border: "1px solid rgba(255,255,255,0.14)",
                backgroundColor: "rgba(48, 48, 52, 0.5)",
                backdropFilter: "blur(14px)",
              }}
              aria-label={zoomLevel === 1 ? "Ativar zoom 2x" : "Voltar para zoom 1x"}
            >
              <span className="flex items-center gap-1.5" style={{ fontSize: "12px", lineHeight: "16px" }}>
                <Search size={14} />
                {zoomLevel}x
              </span>
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                closeLightbox();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors"
              style={{
                border: "1px solid rgba(255,255,255,0.14)",
                backgroundColor: "rgba(48, 48, 52, 0.5)",
                backdropFilter: "blur(14px)",
              }}
              aria-label="Fechar imagem"
            >
              <X size={18} />
            </button>
          </div>

          {hasMultipleSlides && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 z-[123] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition-colors md:left-6"
                style={{
                  border: "1px solid rgba(255,255,255,0.14)",
                  backgroundColor: "rgba(48, 48, 52, 0.5)",
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
                className="absolute right-4 top-1/2 z-[123] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition-colors md:right-6"
                style={{
                  border: "1px solid rgba(255,255,255,0.14)",
                  backgroundColor: "rgba(48, 48, 52, 0.5)",
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
                  backgroundColor: "rgba(16, 16, 18, 0.56)",
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
              style={{
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
                willChange: "transform, opacity, border-radius, box-shadow",
                transformOrigin: "center center",
                backgroundColor: "rgba(10, 10, 12, 0.9)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: `${Math.max(22, Math.min(30, Math.min(targetRect.width, targetRect.height) * 0.03))}px`,
              }}
              initial={{ opacity: 0, scale: 0.985, y: 10, boxShadow: "0 18px 52px rgba(0,0,0,0.2)" }}
              animate={{ opacity: 1, scale: 1, y: 0, boxShadow: "0 34px 100px rgba(0,0,0,0.34)" }}
              exit={{ opacity: 0, scale: 0.985, y: 8, boxShadow: "0 18px 52px rgba(0,0,0,0.2)" }}
              transition={{
                opacity: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
                scale: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
                y: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
                boxShadow: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <AnimatePresence initial={false} mode="wait" custom={slideDirection}>
                    <motion.div
                      key={activeSlide.src}
                      custom={slideDirection}
                      className="relative shrink-0"
                      style={{
                        width: `${fittedImageSize.width}px`,
                        height: `${fittedImageSize.height}px`,
                        willChange: "transform, opacity, border-radius",
                        transformOrigin: "center center",
                      }}
                      initial={imageEnterState}
                      animate={{
                        opacity: 1,
                        x: 0,
                        y: 0,
                        scaleX: 1,
                        scaleY: 1,
                        borderRadius: endRadius,
                      }}
                      exit={imageExitState}
                      transition={{
                        x: slideDirection === 0
                          ? { type: "spring", stiffness: 290, damping: 31, mass: 0.92 }
                          : { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
                        y: slideDirection === 0
                          ? { type: "spring", stiffness: 290, damping: 31, mass: 0.92 }
                          : { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
                        scaleX: slideDirection === 0
                          ? { type: "spring", stiffness: 280, damping: 32, mass: 0.96 }
                          : { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
                        scaleY: slideDirection === 0
                          ? { type: "spring", stiffness: 280, damping: 32, mass: 0.96 }
                          : { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
                        opacity: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
                        borderRadius: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
                      }}
                    >
                      <div
                        className="relative h-full w-full overflow-hidden"
                        style={{
                          cursor: isPannable ? (isDragging ? "grabbing" : "grab") : "default",
                          touchAction: isPannable ? "none" : "auto",
                          borderRadius: `${endRadius}px`,
                        }}
                        onClick={(event) => event.stopPropagation()}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={finishPointerInteraction}
                        onPointerCancel={finishPointerInteraction}
                        onLostPointerCapture={finishPointerInteraction}
                      >
                        <motion.div
                          className="h-full w-full"
                          style={{ transformOrigin: "center center" }}
                          animate={{
                            x: panOffset.x,
                            y: panOffset.y,
                            scale: zoomLevel,
                          }}
                          transition={isDragging
                            ? { duration: 0 }
                            : {
                                x: { type: "spring", stiffness: 340, damping: 36, mass: 0.9 },
                                y: { type: "spring", stiffness: 340, damping: 36, mass: 0.9 },
                                scale: { type: "spring", stiffness: 300, damping: 34, mass: 0.92 },
                              }}
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
                      </div>
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
