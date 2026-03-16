import { useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

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

  return (
    <AnimatePresence>
      {open && src ? (
        <motion.div
          key="lightbox-overlay"
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-xl md:p-8"
          style={{ backgroundColor: "rgba(32, 32, 34, 0.72)" }}
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(18px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
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
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors cursor-pointer"
            style={{
              border: "1px solid rgba(255,255,255,0.14)",
              backgroundColor: "rgba(70, 70, 74, 0.48)",
              backdropFilter: "blur(14px)",
            }}
            initial={{ opacity: 0, scale: 0.88, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -10 }}
            transition={{ duration: 0.22, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Fechar imagem"
          >
            <X size={18} />
          </motion.button>

          <motion.img
            src={src}
            alt={alt}
            className="max-h-[88vh] max-w-[92vw] select-none object-contain"
            style={{
              WebkitTouchCallout: "none",
              userSelect: "none",
            }}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{
              opacity: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
              scale: { type: "spring", stiffness: 320, damping: 28, mass: 0.85 },
              y: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
            }}
            onClick={(event) => event.stopPropagation()}
            onContextMenu={(event) => event.preventDefault()}
            onDragStart={(event) => event.preventDefault()}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
