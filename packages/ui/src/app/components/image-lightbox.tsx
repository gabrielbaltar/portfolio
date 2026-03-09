import { useEffect } from "react";
import { X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ImageLightboxProps {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}

export function ImageLightbox({ open, src, alt, onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || !src) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-xl md:p-8"
      style={{ backgroundColor: "rgba(32, 32, 34, 0.72)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Imagem ampliada"}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors cursor-pointer"
        style={{
          border: "1px solid rgba(255,255,255,0.14)",
          backgroundColor: "rgba(70, 70, 74, 0.48)",
          backdropFilter: "blur(14px)",
        }}
        aria-label="Fechar imagem"
      >
        <X size={18} />
      </button>

      <div
        className="flex max-h-[88vh] max-w-[92vw] items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <ImageWithFallback
          src={src}
          alt={alt}
          className="block h-auto max-h-[88vh] w-auto max-w-[92vw] object-contain"
        />
      </div>
    </div>
  );
}
