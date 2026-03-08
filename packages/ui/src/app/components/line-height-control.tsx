import { Minus, Plus } from "lucide-react";

interface LineHeightControlProps {
  value: number;
  onChange: (value: number) => void;
  compact?: boolean;
}

export function LineHeightControl({ value, onChange, compact = false }: LineHeightControlProps) {
  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "px-1"}`}>
      <span className="text-[#666]" style={{ fontSize: compact ? "10px" : "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        Entre linhas
      </span>
      <div
        className="inline-flex items-center gap-1 rounded-[10px] border px-1.5 py-1"
        style={{ backgroundColor: "#141414", borderColor: "#1e1e1e" }}
      >
        <button
          type="button"
          onClick={() => onChange(value - 2)}
          className="rounded-md p-1 text-[#888] transition-colors hover:bg-[#1a1a1a] hover:text-[#fafafa]"
          aria-label="Diminuir espacamento entre linhas"
        >
          <Minus size={12} />
        </button>
        <span className="w-[42px] text-center text-[#aaa] tabular-nums" style={{ fontSize: compact ? "10px" : "11px" }}>
          {value}px
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 2)}
          className="rounded-md p-1 text-[#888] transition-colors hover:bg-[#1a1a1a] hover:text-[#fafafa]"
          aria-label="Aumentar espacamento entre linhas"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}
