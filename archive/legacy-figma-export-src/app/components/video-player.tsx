import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings, Loader2,
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  caption?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  height?: number;
  borderRadius?: number;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoPlayer({
  src,
  poster,
  caption,
  autoPlay = false,
  loop = false,
  muted = false,
  height = 525,
  borderRadius = 0,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(muted ? 0 : 1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const [hasStarted, setHasStarted] = useState(autoPlay);

  const prevVolume = useRef(1);

  // Play / Pause
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
      setHasStarted(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  // Volume
  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isMuted) {
      v.muted = false;
      v.volume = prevVolume.current || 1;
      setVolume(prevVolume.current || 1);
      setIsMuted(false);
    } else {
      prevVolume.current = v.volume;
      v.muted = true;
      v.volume = 0;
      setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback((val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setIsMuted(val === 0);
    if (val > 0) prevVolume.current = val;
  }, []);

  // Seek
  const handleSeek = useCallback((e: React.MouseEvent) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
    setCurrentTime(v.currentTime);
  }, []);

  // Skip
  const skip = useCallback((seconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + seconds));
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  // Playback rate
  const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const cycleRate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const idx = rates.indexOf(playbackRate);
    const next = rates[(idx + 1) % rates.length];
    v.playbackRate = next;
    setPlaybackRate(next);
  }, [playbackRate]);

  // Auto-hide controls
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (playing) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  // Hover time preview on progress bar
  const handleProgressHover = useCallback((e: React.MouseEvent) => {
    const bar = progressRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(pct * duration);
    setHoverX(e.clientX - rect.left);
  }, [duration]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const el = containerRef.current;
      if (!el || !el.contains(document.activeElement) && !document.fullscreenElement) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-5);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(5);
          break;
        case "ArrowUp":
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [togglePlay, skip, handleVolumeChange, toggleMute, toggleFullscreen, volume]);

  // Video events
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTimeUpdate = () => setCurrentTime(v.currentTime);
    const onDurationChange = () => setDuration(v.duration);
    const onProgress = () => {
      if (v.buffered.length > 0) {
        setBuffered(v.buffered.end(v.buffered.length - 1));
      }
    };
    const onPlay = () => { setPlaying(true); setHasStarted(true); };
    const onPause = () => setPlaying(false);
    const onEnded = () => { setPlaying(false); if (!loop) setHasStarted(false); };
    const onLoadedData = () => setLoading(false);
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);

    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("durationchange", onDurationChange);
    v.addEventListener("progress", onProgress);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    v.addEventListener("loadeddata", onLoadedData);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("canplay", onCanPlay);

    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("durationchange", onDurationChange);
      v.removeEventListener("progress", onProgress);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("loadeddata", onLoadedData);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("canplay", onCanPlay);
    };
  }, [loop]);

  // Fullscreen change listener
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Auto-hide controls when playing
  useEffect(() => {
    if (playing) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    } else {
      setShowControls(true);
    }
    return () => { if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current); };
  }, [playing]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div className="space-y-1">
      <div
        ref={containerRef}
        className="relative overflow-hidden group select-none"
        style={{
          height: isFullscreen ? "100vh" : `${height}px`,
          backgroundColor: "#000",
          cursor: showControls ? "default" : "none",
          borderRadius: isFullscreen ? 0 : `${borderRadius}px`,
        }}
        onMouseMove={showControlsTemporarily}
        onMouseLeave={() => { if (playing) setShowControls(false); setShowSettings(false); }}
        tabIndex={0}
        onClick={(e) => {
          // Don't toggle on control clicks
          if ((e.target as HTMLElement).closest("[data-controls]")) return;
          togglePlay();
        }}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          src={src}
          poster={poster || undefined}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />

        {/* Large center play button (before first play) */}
        {!hasStarted && !playing && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md transition-transform hover:scale-110"
              style={{
                backgroundColor: "rgba(250,250,250,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Play size={28} fill="white" color="white" className="ml-1" />
            </div>
          </div>
        )}

        {/* Loading spinner */}
        {loading && hasStarted && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <Loader2 size={32} className="text-white/80 animate-spin" />
          </div>
        )}

        {/* Controls overlay */}
        <div
          data-controls
          className="absolute inset-x-0 bottom-0 z-20 transition-opacity duration-300"
          style={{
            opacity: showControls ? 1 : 0,
            pointerEvents: showControls ? "auto" : "none",
            background: "linear-gradient(transparent, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.85))",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="relative h-6 flex items-end px-4 cursor-pointer group/progress"
            onClick={handleSeek}
            onMouseMove={handleProgressHover}
            onMouseLeave={() => setHoverTime(null)}
          >
            {/* Track background */}
            <div className="w-full h-1 group-hover/progress:h-1.5 transition-all rounded-full overflow-hidden relative" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
              {/* Buffered */}
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${bufferedPct}%`, backgroundColor: "rgba(255,255,255,0.25)" }}
              />
              {/* Progress */}
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${progress}%`, backgroundColor: "var(--accent-green, #00ff3c)" }}
              />
            </div>
            {/* Scrubber dot */}
            <div
              className="absolute w-3 h-3 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity -translate-x-1/2 pointer-events-none"
              style={{
                left: `calc(${progress}% * (100% - 32px) / 100 + 16px)`,
                bottom: "4px",
                backgroundColor: "var(--accent-green, #00ff3c)",
                boxShadow: "0 0 6px rgba(0,255,60,0.5)",
              }}
            />
            {/* Hover time tooltip */}
            {hoverTime !== null && (
              <div
                className="absolute bottom-6 -translate-x-1/2 px-2 py-0.5 rounded text-white pointer-events-none"
                style={{
                  left: `${Math.max(20, Math.min(hoverX, (progressRef.current?.offsetWidth || 200) - 20))}px`,
                  fontSize: "11px",
                  backgroundColor: "rgba(0,0,0,0.85)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-1 px-3 pb-3 pt-1">
            {/* Left controls */}
            <button
              onClick={togglePlay}
              className="w-8 h-8 flex items-center justify-center rounded-md text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={playing ? "Pausar (K)" : "Reproduzir (K)"}
            >
              {playing ? <Pause size={18} /> : <Play size={18} fill="white" className="ml-0.5" />}
            </button>

            <button
              onClick={() => skip(-10)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Voltar 10s"
            >
              <SkipBack size={14} />
            </button>
            <button
              onClick={() => skip(10)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Avancar 10s"
            >
              <SkipForward size={14} />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1 group/vol">
              <button
                onClick={toggleMute}
                className="w-7 h-7 flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isMuted ? "Ativar som (M)" : "Silenciar (M)"}
              >
                {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <div className="w-0 group-hover/vol:w-16 overflow-hidden transition-all duration-200">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-14 h-1 accent-white cursor-pointer"
                  style={{ accentColor: "var(--accent-green, #00ff3c)" }}
                />
              </div>
            </div>

            {/* Time display */}
            <span className="text-white/60 ml-1 tabular-nums whitespace-nowrap font-['Inter',sans-serif]" style={{ fontSize: "12px" }}>
              {formatTime(currentTime)} <span className="text-white/30">/</span> {formatTime(duration)}
            </span>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right controls */}
            {/* Playback speed */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="h-7 px-2 flex items-center justify-center rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer font-['Inter',sans-serif]"
                style={{ fontSize: "11px" }}
                title="Velocidade"
              >
                {playbackRate !== 1 ? `${playbackRate}x` : <Settings size={14} />}
              </button>
              {showSettings && (
                <div
                  className="absolute bottom-full right-0 mb-2 rounded-lg overflow-hidden backdrop-blur-xl"
                  style={{
                    backgroundColor: "rgba(20,20,20,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    minWidth: "120px",
                  }}
                >
                  <p className="text-white/40 px-3 pt-2 pb-1 font-['Inter',sans-serif]" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Velocidade
                  </p>
                  {rates.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        const v = videoRef.current;
                        if (v) v.playbackRate = r;
                        setPlaybackRate(r);
                        setShowSettings(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 font-['Inter',sans-serif] transition-colors cursor-pointer ${
                        r === playbackRate ? "text-[var(--accent-green,#00ff3c)] bg-white/5" : "text-white/70 hover:bg-white/10"
                      }`}
                      style={{ fontSize: "12px" }}
                    >
                      {r === 1 ? "Normal" : `${r}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isFullscreen ? "Sair da tela cheia (F)" : "Tela cheia (F)"}
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>

        {/* Gradient top (subtle) */}
        <div
          className="absolute inset-x-0 top-0 h-16 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: showControls ? 1 : 0,
            background: "linear-gradient(rgba(0,0,0,0.3), transparent)",
          }}
        />
      </div>

      {/* Caption */}
      {caption && (
        <p
          className="text-center font-['Inter',sans-serif] mt-2"
          style={{ fontSize: "13px", color: "var(--text-secondary, #6f6f6f)" }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}