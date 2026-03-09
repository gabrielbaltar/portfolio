import { useState, useRef, useEffect, useCallback } from "react";
import Hls, { type Level } from "hls.js";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings, Loader2,
} from "lucide-react";
import { resolveVideoSource } from "./video-source";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  caption?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  previewStart?: number;
  previewDuration?: number;
  height?: number;
  borderRadius?: number;
  fit?: "contain" | "cover";
  zoom?: number;
}

interface QualityOption {
  index: number;
  label: string;
  description: string;
  isAuto?: boolean;
}

type PlayButtonTone = "light" | "dark";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatBitrate(bitrate: number) {
  if (!bitrate) return "";
  if (bitrate >= 1_000_000) return `${(bitrate / 1_000_000).toFixed(1)} Mbps`;
  return `${Math.round(bitrate / 1000)} kbps`;
}

function formatQualityLabel(level: Level) {
  if (level.height >= 2160) return "4K";
  if (level.height >= 1440) return "1440p";
  if (level.height >= 1080) return "1080p";
  if (level.height >= 720) return "720p";
  if (level.height >= 480) return "480p";
  if (level.height > 0) return `${level.height}p`;
  return formatBitrate(level.bitrate) || level.name || "Stream";
}

function buildQualityOptions(levels: Level[]): QualityOption[] {
  const manualOptions = levels
    .map((level, index) => {
      const resolution = level.width && level.height ? `${level.width}x${level.height}` : "";
      const bitrate = formatBitrate(level.bitrate);
      const description = [resolution, bitrate].filter(Boolean).join(" • ") || "Stream adaptativo";

      return {
        index,
        label: formatQualityLabel(level),
        description,
        height: level.height || 0,
        bitrate: level.bitrate || 0,
      };
    })
    .sort((a, b) => {
      if (b.height !== a.height) return b.height - a.height;
      return b.bitrate - a.bitrate;
    })
    .map(({ height: _height, bitrate: _bitrate, ...option }) => option);

  return [
    {
      index: -1,
      label: "Auto",
      description: "Ajusta a qualidade conforme a conexao",
      isAuto: true,
    },
    ...manualOptions,
  ];
}

function getHighestQualityIndex(levels: Level[]) {
  let selectedIndex = -1;
  let selectedHeight = -1;
  let selectedBitrate = -1;

  levels.forEach((level, index) => {
    const height = level.height || 0;
    const bitrate = level.bitrate || 0;
    if (height > selectedHeight || (height === selectedHeight && bitrate > selectedBitrate)) {
      selectedIndex = index;
      selectedHeight = height;
      selectedBitrate = bitrate;
    }
  });

  return selectedIndex;
}

function sampleAverageLuminance(image: CanvasImageSource, sourceWidth: number, sourceHeight: number) {
  if (!sourceWidth || !sourceHeight || typeof document === "undefined") return null;

  const targetWidth = 48;
  const targetHeight = 48;
  const centerWidth = Math.max(1, Math.floor(sourceWidth * 0.28));
  const centerHeight = Math.max(1, Math.floor(sourceHeight * 0.28));
  const sx = Math.max(0, Math.floor((sourceWidth - centerWidth) / 2));
  const sy = Math.max(0, Math.floor((sourceHeight - centerHeight) / 2));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  try {
    context.drawImage(image, sx, sy, centerWidth, centerHeight, 0, 0, targetWidth, targetHeight);
    const { data } = context.getImageData(0, 0, targetWidth, targetHeight);
    let luminanceTotal = 0;
    let sampleCount = 0;

    for (let index = 0; index < data.length; index += 16) {
      const alpha = data[index + 3];
      if (alpha < 24) continue;

      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      luminanceTotal += 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      sampleCount += 1;
    }

    if (!sampleCount) return null;
    return luminanceTotal / sampleCount;
  } catch {
    return null;
  }
}

function getToneFromLuminance(luminance: number | null, previousTone: PlayButtonTone) {
  if (luminance == null) return previousTone;
  if (luminance >= 172) return "dark";
  if (luminance <= 142) return "light";
  return previousTone;
}

export function VideoPlayer({
  src,
  poster,
  caption,
  autoPlay = false,
  loop = false,
  muted = false,
  previewStart = 0,
  previewDuration = 4,
  height = 525,
  borderRadius = 0,
  fit = "contain",
  zoom = 1,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
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
  const [error, setError] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [qualityOptions, setQualityOptions] = useState<QualityOption[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1);
  const [playButtonTone, setPlayButtonTone] = useState<PlayButtonTone>("light");
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const [fullPlaybackStarted, setFullPlaybackStarted] = useState(autoPlay);

  const prevVolume = useRef(1);
  const normalizedPreviewStart = Math.max(0, previewStart || 0);
  const resolvedSource = resolveVideoSource(src, poster, normalizedPreviewStart);
  const showPrimaryPlayButton = !error && !playing && !loading && (!fullPlaybackStarted || currentTime <= 0.1);
  const normalizedZoom = Math.max(1, Math.min(1.6, zoom || 1));
  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  // Play / Pause
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      if (Number.isFinite(v.duration) && v.duration > 0 && v.currentTime >= v.duration - 0.1) {
        v.currentTime = 0;
      }
      setFullPlaybackStarted(true);
      void v.play().then(() => {
        setPlaying(true);
        setError(false);
      }).catch(() => {
        setPlaying(false);
        setError(true);
        setFullPlaybackStarted(false);
      });
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

  const applyQuality = useCallback((levelIndex: number) => {
    const hls = hlsRef.current;
    if (!hls) return;

    setSelectedQuality(levelIndex);
    if (levelIndex < 0) {
      hls.currentLevel = -1;
      hls.loadLevel = -1;
      hls.nextLevel = -1;
      return;
    }

    hls.currentLevel = levelIndex;
    hls.loadLevel = levelIndex;
    hls.nextLevel = levelIndex;

    if (videoRef.current?.paused) {
      hls.currentLevel = levelIndex;
    }
  }, []);

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
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      if (!loop) {
        setFullPlaybackStarted(false);
      }
    };
    const onLoadedData = () => { setLoading(false); setError(false); };
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => { setLoading(false); setError(false); };
    const onError = () => {
      setLoading(false);
      setPlaying(false);
      setError(true);
    };

    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("durationchange", onDurationChange);
    v.addEventListener("progress", onProgress);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    v.addEventListener("loadeddata", onLoadedData);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("error", onError);

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
      v.removeEventListener("error", onError);
    };
  }, [loop]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    destroyHls();
    v.pause();
    v.removeAttribute("src");
    v.load();
    setQualityOptions([]);
    setSelectedQuality(-1);

    if (!resolvedSource.src) {
      setLoading(false);
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    if (!resolvedSource.isHls) {
      v.src = resolvedSource.src;
      v.load();
      return;
    }

    if (!Hls.isSupported()) {
      if (v.canPlayType("application/vnd.apple.mpegurl")) {
        v.src = resolvedSource.src;
        v.load();
        return;
      }
      setLoading(false);
      setError(true);
      return;
    }

    const hls = new Hls({
      enableWorker: true,
      backBufferLength: 90,
      startLevel: resolvedSource.muxPlaybackId ? 0 : -1,
    });

    hlsRef.current = hls;
    hls.attachMedia(v);
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(resolvedSource.src);
    });
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      const options = buildQualityOptions(hls.levels);
      setQualityOptions(options);
      const highestLevel = getHighestQualityIndex(hls.levels);
      if (highestLevel >= 0) {
        hls.currentLevel = highestLevel;
        hls.loadLevel = highestLevel;
        hls.nextLevel = highestLevel;
        setSelectedQuality(highestLevel);
      } else {
        setSelectedQuality(-1);
      }
      setLoading(false);
      setError(false);
    });
    hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
      if (hls.autoLevelEnabled || hls.loadLevel < 0) return;
      setSelectedQuality(data.level);
    });
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal) return;

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
        return;
      }

      setQualityOptions([]);
      setSelectedQuality(-1);
      setLoading(false);
      setPlaying(false);
      setError(true);
      destroyHls();
    });

    return () => {
      destroyHls();
    };
  }, [destroyHls, resolvedSource.isHls, resolvedSource.src]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setFullPlaybackStarted(autoPlay);
    setPlaying(false);
    setCurrentTime(0);
    setBuffered(0);
    setPlayButtonTone("light");
  }, [autoPlay, resolvedSource.src]);

  useEffect(() => {
    const posterUrl = resolvedSource.poster?.trim();
    if (!posterUrl || typeof Image === "undefined") return;

    let cancelled = false;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cancelled) return;
      const luminance = sampleAverageLuminance(image, image.naturalWidth, image.naturalHeight);
      setPlayButtonTone((previousTone) => getToneFromLuminance(luminance, previousTone));
    };
    image.src = posterUrl;

    return () => {
      cancelled = true;
    };
  }, [resolvedSource.poster]);

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
          poster={resolvedSource.poster || undefined}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          className="h-full w-full"
          style={{
            objectFit: fit,
            transform: normalizedZoom === 1 ? undefined : `scale(${normalizedZoom})`,
            transformOrigin: "center center",
          }}
        />

        {/* Large center play button */}
        {showPrimaryPlayButton && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div
              className="w-16 h-16 rounded-full flex cursor-pointer items-center justify-center backdrop-blur-md transition-transform hover:scale-110"
              style={{
                backgroundColor: playButtonTone === "dark" ? "rgba(8,8,8,0.55)" : "rgba(250,250,250,0.15)",
                border: playButtonTone === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.2)",
                boxShadow: playButtonTone === "dark" ? "0 12px 30px rgba(0,0,0,0.28)" : "0 10px 24px rgba(0,0,0,0.18)",
              }}
            >
              <Play
                size={28}
                fill={playButtonTone === "dark" ? "#fafafa" : "white"}
                color={playButtonTone === "dark" ? "#fafafa" : "white"}
                className="ml-1"
              />
            </div>
          </div>
        )}

        {/* Loading spinner */}
        {loading && fullPlaybackStarted && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <Loader2 size={32} className="text-white/80 animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/75 px-6 text-center text-white">
            <div className="space-y-2">
              <p style={{ fontSize: "14px", lineHeight: "21px", fontWeight: 500 }}>
                Este navegador nao conseguiu reproduzir o video.
              </p>
              <p className="text-white/70" style={{ fontSize: "12px", lineHeight: "18px" }}>
                Para compatibilidade maxima, use MP4 H.264, WebM ou um playback HLS do Mux.
              </p>
            </div>
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
                title="Configuracoes"
              >
                <Settings size={14} />
              </button>
              {showSettings && (
                <div
                  className="absolute bottom-full right-0 mb-2 rounded-lg overflow-hidden backdrop-blur-xl"
                  style={{
                    backgroundColor: "rgba(20,20,20,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    minWidth: "170px",
                  }}
                >
                  {qualityOptions.length > 0 && (
                    <>
                      <p className="text-white/40 px-3 pt-2 pb-1 font-['Inter',sans-serif]" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Qualidade
                      </p>
                      {qualityOptions.map((option) => (
                        <button
                          key={option.index}
                          onClick={() => {
                            applyQuality(option.index);
                            setShowSettings(false);
                          }}
                          className={`w-full text-left px-3 py-2 font-['Inter',sans-serif] transition-colors cursor-pointer ${
                            option.index === selectedQuality ? "text-[var(--accent-green,#00ff3c)] bg-white/5" : "text-white/78 hover:bg-white/10"
                          }`}
                        >
                          <span className="block" style={{ fontSize: "12px", lineHeight: "16px" }}>
                            {option.label}
                          </span>
                          <span className="block text-white/35" style={{ fontSize: "10px", lineHeight: "14px" }}>
                            {option.description}
                          </span>
                        </button>
                      ))}
                    </>
                  )}
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
