import { useState, useRef, useCallback, useEffect } from "react";
import { Move, Check, RotateCcw } from "lucide-react";

/**
 * ImagePositionEditor — Allows the user to drag/reposition an image 
 * within a fixed 525px-height viewport and save the object-position.
 * 
 * The `position` prop is a CSS object-position string like "50% 30%".
 * Default is "50% 50%" (centered).
 */

interface ImagePositionEditorProps {
  src: string;
  position: string; // e.g. "50% 50%"
  onChange: (position: string) => void;
  height?: number;
  label?: string;
}

export function ImagePositionEditor({
  src,
  position = "50% 50%",
  onChange,
  height = 525,
  label,
}: ImagePositionEditorProps) {
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>(() => parsePosition(position));
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({
    mouseX: 0, mouseY: 0, posX: 50, posY: 50,
  });

  // Sync when position prop changes externally
  useEffect(() => {
    if (!editing) {
      setPos(parsePosition(position));
    }
  }, [position, editing]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
  };

  const needsRepositioning = useCallback(() => {
    if (!naturalSize || !containerRef.current) return false;
    const containerW = containerRef.current.offsetWidth;
    const containerH = height;
    // Check if image overflows the container (i.e. it's cropped)
    const scaleToFillW = containerW / naturalSize.w;
    const scaleToFillH = containerH / naturalSize.h;
    const scale = Math.max(scaleToFillW, scaleToFillH);
    const scaledW = naturalSize.w * scale;
    const scaledH = naturalSize.h * scale;
    // If either dimension overflows significantly, repositioning is useful
    return scaledW > containerW + 2 || scaledH > containerH + 2;
  }, [naturalSize, height]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!editing) return;
    e.preventDefault();
    setDragging(true);
    startRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };
  }, [editing, pos]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    const containerW = containerRef.current.offsetWidth;
    const containerH = height;
    
    const deltaX = e.clientX - startRef.current.mouseX;
    const deltaY = e.clientY - startRef.current.mouseY;
    
    // Convert pixel delta to percentage — invert direction (dragging right = lower %)
    const pctDeltaX = -(deltaX / containerW) * 100;
    const pctDeltaY = -(deltaY / containerH) * 100;
    
    const newX = Math.max(0, Math.min(100, startRef.current.posX + pctDeltaX));
    const newY = Math.max(0, Math.min(100, startRef.current.posY + pctDeltaY));
    
    setPos({ x: Math.round(newX), y: Math.round(newY) });
  }, [dragging, height]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!editing) return;
    const touch = e.touches[0];
    setDragging(true);
    startRef.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      posX: pos.x,
      posY: pos.y,
    };
  }, [editing, pos]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragging || !containerRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const containerW = containerRef.current.offsetWidth;
    const containerH = height;
    
    const deltaX = touch.clientX - startRef.current.mouseX;
    const deltaY = touch.clientY - startRef.current.mouseY;
    
    const pctDeltaX = -(deltaX / containerW) * 100;
    const pctDeltaY = -(deltaY / containerH) * 100;
    
    const newX = Math.max(0, Math.min(100, startRef.current.posX + pctDeltaX));
    const newY = Math.max(0, Math.min(100, startRef.current.posY + pctDeltaY));
    
    setPos({ x: Math.round(newX), y: Math.round(newY) });
  }, [dragging, height]);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const confirmPosition = () => {
    const posStr = `${pos.x}% ${pos.y}%`;
    onChange(posStr);
    setEditing(false);
  };

  const resetPosition = () => {
    setPos({ x: 50, y: 50 });
    onChange("50% 50%");
    setEditing(false);
  };

  const canReposition = needsRepositioning();

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-[#888]" style={{ fontSize: "12px" }}>{label}</p>
      )}
      <div
        ref={containerRef}
        className={`relative rounded-lg overflow-hidden ${editing ? "ring-2 ring-blue-500" : ""}`}
        style={{
          height: `${height}px`,
          maxHeight: `${height}px`,
          cursor: editing ? (dragging ? "grabbing" : "grab") : "default",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          onLoad={handleImageLoad}
          className="w-full h-full select-none"
          style={{
            objectFit: "cover",
            objectPosition: `${pos.x}% ${pos.y}%`,
          }}
        />

        {/* Editing overlay */}
        {editing && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Grid lines */}
            <div className="absolute inset-0" style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "33.33% 33.33%",
            }} />
            {/* Crosshair at center */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border-2 border-white/60 rounded-full" />
            {/* Position indicator */}
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center gap-2"
              style={{ fontSize: "11px" }}
            >
              <Move size={12} />
              Arraste para reposicionar ({pos.x}%, {pos.y}%)
            </div>
          </div>
        )}

        {/* Actions overlay when not editing */}
        {!editing && canReposition && (
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            style={{ fontSize: "12px" }}
          >
            <Move size={13} /> Reposicionar
          </button>
        )}
      </div>

      {/* Editing controls */}
      {editing && (
        <div className="flex items-center gap-2">
          <button
            onClick={confirmPosition}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white cursor-pointer transition-colors"
            style={{ fontSize: "12px", backgroundColor: "#22c55e" }}
          >
            <Check size={13} /> Confirmar
          </button>
          <button
            onClick={resetPosition}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#aaa] hover:text-white cursor-pointer transition-colors"
            style={{ fontSize: "12px", backgroundColor: "#222", border: "1px solid #333" }}
          >
            <RotateCcw size={13} /> Centralizar
          </button>
          <button
            onClick={() => { setPos(parsePosition(position)); setEditing(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#aaa] hover:text-white cursor-pointer transition-colors"
            style={{ fontSize: "12px", backgroundColor: "#222", border: "1px solid #333" }}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for gallery images — smaller height and inline controls
 */
export function ImagePositionEditorCompact({
  src,
  position = "50% 50%",
  onChange,
  onRemove,
  height = 200,
}: {
  src: string;
  position: string;
  onChange: (position: string) => void;
  onRemove: () => void;
  height?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>(() => parsePosition(position));
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({
    mouseX: 0, mouseY: 0, posX: 50, posY: 50,
  });

  useEffect(() => {
    if (!editing) setPos(parsePosition(position));
  }, [position, editing]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setNaturalSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight });
  };

  const needsRepositioning = useCallback(() => {
    if (!naturalSize || !containerRef.current) return false;
    const containerW = containerRef.current.offsetWidth;
    const scaleW = containerW / naturalSize.w;
    const scaleH = height / naturalSize.h;
    const scale = Math.max(scaleW, scaleH);
    return naturalSize.w * scale > containerW + 2 || naturalSize.h * scale > height + 2;
  }, [naturalSize, height]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!editing) return;
    e.preventDefault();
    setDragging(true);
    startRef.current = { mouseX: e.clientX, mouseY: e.clientY, posX: pos.x, posY: pos.y };
  }, [editing, pos]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    const cW = containerRef.current.offsetWidth;
    const dX = -(e.clientX - startRef.current.mouseX) / cW * 100;
    const dY = -(e.clientY - startRef.current.mouseY) / height * 100;
    setPos({
      x: Math.round(Math.max(0, Math.min(100, startRef.current.posX + dX))),
      y: Math.round(Math.max(0, Math.min(100, startRef.current.posY + dY))),
    });
  }, [dragging, height]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  const canReposition = needsRepositioning();

  return (
    <div
      ref={containerRef}
      className={`relative group rounded-lg overflow-hidden ${editing ? "ring-2 ring-blue-500" : ""}`}
      style={{ height: `${height}px`, cursor: editing ? (dragging ? "grabbing" : "grab") : "default" }}
      onMouseDown={handleMouseDown}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        onLoad={handleImageLoad}
        className="w-full h-full select-none"
        style={{ objectFit: "cover", objectPosition: `${pos.x}% ${pos.y}%` }}
      />

      {editing ? (
        <>
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "33.33% 33.33%",
          }} />
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-black/70 text-white px-2 py-0.5 rounded-full flex items-center gap-2" style={{ fontSize: "10px" }}>
            <Move size={10} /> {pos.x}%, {pos.y}%
          </div>
          <div className="absolute top-1.5 right-1.5 flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onChange(`${pos.x}% ${pos.y}%`); setEditing(false); }}
              className="p-1 rounded bg-green-600/90 text-white cursor-pointer"
            ><Check size={12} /></button>
            <button
              onClick={(e) => { e.stopPropagation(); setPos(parsePosition(position)); setEditing(false); }}
              className="p-1 rounded bg-black/60 text-white cursor-pointer"
            >✕</button>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          {canReposition && (
            <button
              onClick={(e) => { e.stopPropagation(); setEditing(true); }}
              className="bg-[#222]/80 hover:bg-[#333] text-white rounded-md px-2 py-1 cursor-pointer flex items-center gap-1 backdrop-blur-sm"
              style={{ fontSize: "11px" }}
            ><Move size={11} /> Reposicionar</button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="bg-red-600/80 hover:bg-red-600 text-white rounded-md px-2 py-1 cursor-pointer flex items-center gap-1 backdrop-blur-sm"
            style={{ fontSize: "11px" }}
          >✕ Remover</button>
        </div>
      )}
    </div>
  );
}

/** Parse "X% Y%" string into { x, y } numbers */
function parsePosition(pos: string): { x: number; y: number } {
  if (!pos || typeof pos !== "string") return { x: 50, y: 50 };
  const parts = pos.trim().split(/\s+/);
  const x = parseInt(parts[0]) || 50;
  const y = parseInt(parts[1]) || 50;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}
