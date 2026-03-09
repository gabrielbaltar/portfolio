const MUX_STREAM_HOST = "stream.mux.com";
const MUX_IMAGE_HOST = "image.mux.com";
const MUX_PLAYER_HOST = "player.mux.com";

function safeParseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function normalizeMuxPlaybackId(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const withoutQuery = trimmed.split("?")[0]?.trim() || "";
  const playbackMatch = withoutQuery.match(/([a-zA-Z0-9_-]+)(?:\.(?:m3u8|mp4))?$/);
  return playbackMatch?.[1] || "";
}

export function extractMuxPlaybackId(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const parsed = safeParseUrl(trimmed);
  if (parsed) {
    if (parsed.hostname === MUX_STREAM_HOST) {
      return normalizeMuxPlaybackId(parsed.pathname);
    }

    if (parsed.hostname === MUX_IMAGE_HOST) {
      const [, playbackId] = parsed.pathname.split("/");
      return normalizeMuxPlaybackId(playbackId || "");
    }

    if (parsed.hostname === MUX_PLAYER_HOST) {
      const [, playbackId] = parsed.pathname.split("/");
      return normalizeMuxPlaybackId(playbackId || "");
    }

    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) return "";
  return normalizeMuxPlaybackId(trimmed);
}

export function buildMuxPlaybackUrl(playbackId: string) {
  return `https://${MUX_STREAM_HOST}/${playbackId}.m3u8?rendition_order=desc`;
}

export function buildMuxPosterUrl(playbackId: string, time = 0) {
  return `https://${MUX_IMAGE_HOST}/${playbackId}/thumbnail.jpg?time=${Math.max(0, time)}`;
}

export function isHlsSource(value: string) {
  return /\.m3u8(?:$|\?)/i.test(value.trim());
}

export function normalizeVideoInput(value: string) {
  const trimmed = value.trim();
  const muxPlaybackId = extractMuxPlaybackId(trimmed);
  if (muxPlaybackId) return muxPlaybackId;
  return trimmed;
}

export function resolveVideoSource(
  value: string,
  poster?: string,
  previewStart = 0,
) {
  const muxPlaybackId = extractMuxPlaybackId(value);
  const src = muxPlaybackId ? buildMuxPlaybackUrl(muxPlaybackId) : value.trim();

  return {
    src,
    poster: poster?.trim() || (muxPlaybackId ? buildMuxPosterUrl(muxPlaybackId, previewStart) : undefined),
    muxPlaybackId,
    isHls: isHlsSource(src),
  };
}
