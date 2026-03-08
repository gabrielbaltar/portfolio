import type { CSSProperties } from "react";
import { ImageIcon } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ContentImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  style?: CSSProperties;
  position?: string;
  emptyLabel?: string;
  iconSize?: number;
}

export function ContentImage({
  src,
  alt,
  className = "",
  style,
  position = "50% 50%",
  emptyLabel = "Sem imagem",
  iconSize = 18,
}: ContentImageProps) {
  if (src && src.trim() !== "") {
    return (
      <ImageWithFallback
        src={src}
        alt={alt}
        className={className}
        style={{ ...style, objectPosition: position }}
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
