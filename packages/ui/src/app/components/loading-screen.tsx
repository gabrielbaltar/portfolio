export function LoadingScreen({ label = "Carregando..." }: { label?: string }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center font-['Inter',sans-serif]"
      style={{ backgroundColor: "#0a0a0a", color: "#fafafa" }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#2a2a2a", borderTopColor: "#fafafa" }}
        />
        <span style={{ fontSize: "13px", color: "#888" }}>{label}</span>
      </div>
    </div>
  );
}
