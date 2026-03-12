import { useEffect } from "react";
import { X } from "lucide-react";

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
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
      onContextMenu={(event) => event.preventDefault()}
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Imagem ampliada"}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
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
        onContextMenu={(event) => event.preventDefault()}
      >
        <div
          role="img"
          aria-label={alt}
          className="max-h-[88vh] max-w-[92vw] select-none bg-center bg-no-repeat"
          style={{
            width: "min(92vw, 1500px)",
            height: "min(88vh, 1100px)",
            backgroundImage: `url("${src}")`,
            backgroundSize: "contain",
            WebkitTouchCallout: "none",
            userSelect: "none",
          }}
          onContextMenu={(event) => event.preventDefault()}
          onDragStart={(event) => event.preventDefault()}
        />
      </div>
    </div>
  );
}
