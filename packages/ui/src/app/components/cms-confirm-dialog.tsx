import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

type CMSConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  busy?: boolean;
  tone?: "danger" | "neutral";
};

export function CMSConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  busy = false,
  tone = "danger",
}: CMSConfirmDialogProps) {
  const palette =
    tone === "danger"
      ? {
          iconBg: "#2a1414",
          iconColor: "#ef4444",
          confirmBg: "#ef4444",
          confirmText: "#111111",
        }
      : {
          iconBg: "#141f2a",
          iconColor: "#60a5fa",
          confirmBg: "#fafafa",
          confirmText: "#111111",
        };

  return (
    <AlertDialog open={open} onOpenChange={busy ? undefined : onOpenChange}>
      <AlertDialogContent
        className="w-[calc(100%-2rem)] max-w-[420px] gap-0 rounded-[18px] border p-0 shadow-2xl"
        style={{ backgroundColor: "#111111", borderColor: "#2a2a2a" }}
      >
        <div className="p-5">
          <AlertDialogHeader className="text-left">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[12px]" style={{ backgroundColor: palette.iconBg }}>
              <AlertTriangle size={18} style={{ color: palette.iconColor }} />
            </div>
            <AlertDialogTitle className="text-[#fafafa]" style={{ fontSize: "18px", lineHeight: "27px", fontWeight: 500 }}>
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-1 text-[#888888]" style={{ fontSize: "13px", lineHeight: "19.5px" }}>
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter
          className="flex flex-row items-center justify-end gap-2 border-t px-5 py-4"
          style={{ borderColor: "#1e1e1e" }}
        >
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            className="flex h-[35.5px] items-center rounded-[10px] border px-4 text-[#cccccc] transition-colors hover:bg-[#161616] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ borderColor: "#2a2a2a", fontSize: "13px", lineHeight: "19.5px" }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={busy}
            className="flex h-[35.5px] items-center rounded-[10px] px-4 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: palette.confirmBg,
              color: palette.confirmText,
              fontSize: "13px",
              lineHeight: "19.5px",
            }}
          >
            {busy ? "Processando..." : confirmLabel}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
