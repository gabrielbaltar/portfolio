import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { ImageIcon } from "lucide-react";
import { type CSSProperties, type MouseEventHandler, useEffect, useRef, useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ContentImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  style?: CSSProperties;
  position?: string;
  emptyLabel?: string;
  iconSize?: number;
  onClick?: MouseEventHandler<HTMLElement>;
  mimeType?: string | null;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  poster?: string;
  preload?: "none" | "metadata" | "auto";
  pauseWhenHidden?: boolean;
}

export type VisualAssetKind = "empty" | "image" | "video" | "lottie";

const IMAGE_EXTENSIONS = new Set(["avif", "gif", "jpeg", "jpg", "png", "svg", "webp"]);
const VIDEO_EXTENSIONS = new Set(["webm", "mp4", "mov", "m4v", "ogg", "ogv"]);
const LOTTIE_EXTENSIONS = new Set(["json", "lottie"]);

function getAssetExtension(value?: string | null) {
  if (!value) return "";

  try {
    const parsed = new URL(value, "https://portfolio.local");
    const pathname = parsed.pathname.toLowerCase();
    const extension = pathname.split(".").pop();
    return extension?.trim() || "";
  } catch {
    const sanitized = value.split("?")[0]?.split("#")[0]?.toLowerCase() || "";
    const extension = sanitized.split(".").pop();
    return extension?.trim() || "";
  }
}

export function inferVisualAssetKind(src?: string | null, mimeType?: string | null): VisualAssetKind {
  const normalizedSrc = src?.trim() || "";
  const normalizedMimeType = mimeType?.trim().toLowerCase() || "";
  const extension = getAssetExtension(normalizedSrc);
  const dataUrlMatch = normalizedSrc.match(/^data:([^;,]+)[;,]/i);
  const dataUrlMimeType = dataUrlMatch?.[1]?.toLowerCase() || "";
  const resolvedMimeType = normalizedMimeType || dataUrlMimeType;

  if (!normalizedSrc) return "empty";
  if (resolvedMimeType.startsWith("video/") || VIDEO_EXTENSIONS.has(extension)) return "video";
  if (resolvedMimeType === "application/json" || resolvedMimeType.endsWith("+json") || LOTTIE_EXTENSIONS.has(extension)) {
    return "lottie";
  }

  return "image";
}

export function isSupportedVisualUpload(file: File) {
  const mimeType = file.type.trim().toLowerCase();
  const extension = getAssetExtension(file.name);

  return (
    mimeType.startsWith("image/") ||
    mimeType.startsWith("video/") ||
    mimeType === "application/json" ||
    mimeType.endsWith("+json") ||
    IMAGE_EXTENSIONS.has(extension) ||
    VIDEO_EXTENSIONS.has(extension) ||
    LOTTIE_EXTENSIONS.has(extension)
  );
}

export function canOpenInImageLightbox(src?: string | null, mimeType?: string | null) {
  return inferVisualAssetKind(src, mimeType) === "image";
}

export function supportsPositionEditor(src?: string | null, mimeType?: string | null) {
  return inferVisualAssetKind(src, mimeType) === "image";
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function resolveLottieFit(className: string) {
  if (className.includes("object-contain")) return "contain";
  if (className.includes("object-fill")) return "fill";
  return "cover";
}

function clampDevicePixelRatio(value: number) {
  return Math.min(Math.max(value || 1, 1), 2);
}

function VideoAsset({
  src,
  alt,
  className,
  style,
  position,
  onClick,
  autoPlay,
  loop,
  muted,
  controls,
  poster,
  preload,
  pauseWhenHidden,
}: Required<Pick<ContentImageProps, "alt" | "className" | "position">> &
  Pick<ContentImageProps, "src" | "style" | "onClick" | "autoPlay" | "loop" | "muted" | "controls" | "poster" | "preload" | "pauseWhenHidden">) {
  const reducedMotion = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!pauseWhenHidden || typeof IntersectionObserver === "undefined" || !videoRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [pauseWhenHidden, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const shouldPlay = Boolean(autoPlay && !controls && !reducedMotion && (!pauseWhenHidden || isVisible));
    if (shouldPlay) {
      void video.play().catch(() => {});
      return;
    }

    if (!video.paused) {
      video.pause();
    }
  }, [autoPlay, controls, isVisible, pauseWhenHidden, reducedMotion, src]);

  return (
    <video
      ref={videoRef}
      src={src || undefined}
      aria-label={alt}
      className={className}
      style={{ ...style, objectPosition: position }}
      onClick={onClick}
      autoPlay={Boolean(autoPlay && !controls && !reducedMotion)}
      loop={Boolean(loop)}
      muted={Boolean(muted || autoPlay)}
      playsInline
      controls={Boolean(controls)}
      poster={poster || undefined}
      preload={preload}
    />
  );
}

export function ContentImage({
  src,
  alt,
  className = "",
  style,
  position = "50% 50%",
  emptyLabel = "Sem imagem",
  iconSize = 18,
  onClick,
  mimeType,
  autoPlay = true,
  loop = true,
  muted = false,
  controls = false,
  poster,
  preload = "metadata",
  pauseWhenHidden = true,
}: ContentImageProps) {
  const assetKind = inferVisualAssetKind(src, mimeType);
  const reducedMotion = usePrefersReducedMotion();
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDevicePixelRatio(clampDevicePixelRatio(window.devicePixelRatio || 1));
  }, []);

  if (assetKind === "video") {
    return (
      <VideoAsset
        src={src}
        alt={alt}
        className={className}
        style={style}
        position={position}
        onClick={onClick}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={controls}
        poster={poster}
        preload={preload}
        pauseWhenHidden={pauseWhenHidden}
      />
    );
  }

  if (assetKind === "lottie" && src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`overflow-hidden ${className}`.trim()}
        style={style}
        onClick={onClick}
      >
        <DotLottieReact
          src={src}
          autoplay={Boolean(autoPlay && !reducedMotion)}
          loop={Boolean(loop)}
          className="h-full w-full"
          renderConfig={{
            autoResize: true,
            devicePixelRatio,
            freezeOnOffscreen: pauseWhenHidden,
            quality: 100,
          }}
          layout={{
            align: [0.5, 0.5],
            fit: resolveLottieFit(className),
          }}
          style={{ display: "block", height: "100%", width: "100%" }}
        />
      </div>
    );
  }

  if (assetKind === "image" && src && src.trim() !== "") {
    return (
      <ImageWithFallback
        src={src}
        alt={alt}
        className={className}
        style={{ ...style, objectPosition: position }}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center text-center ${className}`}
      style={{
        ...style,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
      }}
    >
      <div className="flex flex-col items-center gap-2 px-4" style={{ color: "var(--text-secondary, #777)" }}>
        <ImageIcon size={iconSize} />
        <span style={{ fontSize: "12px", lineHeight: "18px" }}>{emptyLabel}</span>
      </div>
    </div>
  );
}
