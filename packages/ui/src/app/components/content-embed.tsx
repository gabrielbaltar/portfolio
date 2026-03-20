import { ExternalLink } from "lucide-react";
import type { ContentBlock } from "./cms-data";
import { RichTextContent, richTextToPlainText } from "./rich-text";

type EmbedBlock = Extract<ContentBlock, { type: "embed" }>;
type EmbedProvider =
  | "figma"
  | "miro"
  | "notion"
  | "youtube"
  | "vimeo"
  | "loom"
  | "generic";

export interface ParsedEmbedInput {
  src: string | null;
  height?: number;
}

export interface ResolvedEmbed {
  provider: EmbedProvider;
  providerLabel: string;
  embedUrl: string | null;
  sourceUrl: string | null;
  height: number;
  helpText?: string;
}

const DEFAULT_EMBED_ALLOW = "accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share";
const MIN_EMBED_HEIGHT = 280;
const MAX_EMBED_HEIGHT = 960;

function clampHeight(value: number) {
  return Math.max(MIN_EMBED_HEIGHT, Math.min(MAX_EMBED_HEIGHT, Math.round(value)));
}

function parsePixelDimension(value: string | null | undefined) {
  if (!value) return undefined;
  const match = value.trim().match(/^(\d{2,4})(?:px)?$/i);
  if (!match) return undefined;
  const numeric = Number(match[1]);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function extractIframeAttribute(input: string, attribute: string) {
  const escaped = attribute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`${escaped}\\s*=\\s*["']([^"']+)["']`, "i");
  return input.match(regex)?.[1] ?? null;
}

export function parseEmbedInput(input: string): ParsedEmbedInput {
  const trimmed = input.trim();
  if (!trimmed) return { src: null };

  if (/^<iframe[\s>]/i.test(trimmed)) {
    return {
      src: extractIframeAttribute(trimmed, "src"),
      height: parsePixelDimension(extractIframeAttribute(trimmed, "height")),
    };
  }

  return {
    src: trimmed,
  };
}

function normalizeHttpUrl(rawValue: string | null) {
  if (!rawValue) return null;

  const trimmed = rawValue.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : /^www\./i.test(trimmed)
      ? `https://${trimmed}`
      : null;

  if (!withProtocol) return null;

  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function matchYouTubeVideoId(url: URL) {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    return url.pathname.split("/").filter(Boolean)[0] ?? null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (url.pathname === "/watch") return url.searchParams.get("v");
    if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] ?? null;
    if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2] ?? null;
  }

  return null;
}

function matchVimeoVideoId(url: URL) {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "player.vimeo.com" && url.pathname.startsWith("/video/")) {
    return url.pathname.split("/")[2] ?? null;
  }
  if (host === "vimeo.com") {
    return url.pathname.split("/").filter(Boolean)[0] ?? null;
  }
  return null;
}

function matchLoomVideoId(url: URL) {
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "loom.com") return null;

  const [, section, id] = url.pathname.split("/");
  if ((section === "share" || section === "embed") && id) return id;
  return null;
}

function extractMiroBoardPath(pathname: string) {
  const match = pathname.match(/^\/app\/(?:board|live-embed)\/([^/]+)\/?$/i);
  return match?.[1] ?? null;
}

export function resolveEmbed(input: string, configuredHeight?: number): ResolvedEmbed {
  const parsedInput = parseEmbedInput(input);
  const normalizedUrl = normalizeHttpUrl(parsedInput.src);
  const preferredHeight = configuredHeight ?? parsedInput.height;

  if (!normalizedUrl) {
    return {
      provider: "generic",
      providerLabel: "Embed",
      embedUrl: null,
      sourceUrl: null,
      height: clampHeight(preferredHeight ?? 520),
      helpText: "Cole um link publico ou o codigo completo do iframe.",
    };
  }

  const host = normalizedUrl.hostname.replace(/^www\./, "").toLowerCase();
  const sourceUrl = normalizedUrl.toString();

  if (host.endsWith("figma.com")) {
    if (normalizedUrl.pathname.startsWith("/embed")) {
      return {
        provider: "figma",
        providerLabel: "Figma",
        embedUrl: sourceUrl,
        sourceUrl: normalizedUrl.searchParams.get("url") || sourceUrl,
        height: clampHeight(preferredHeight ?? 560),
      };
    }

    return {
      provider: "figma",
      providerLabel: "Figma",
      embedUrl: `https://www.figma.com/embed?embed_host=portfolio&url=${encodeURIComponent(sourceUrl)}`,
      sourceUrl,
      height: clampHeight(preferredHeight ?? 560),
      helpText: "Aceita links de arquivo, design ou prototipo compartilhados do Figma.",
    };
  }

  if (host.endsWith("miro.com")) {
    const boardPath = extractMiroBoardPath(normalizedUrl.pathname);
    if (boardPath) {
      const livePath = normalizedUrl.pathname.includes("/live-embed/")
        ? normalizedUrl.pathname
        : normalizedUrl.pathname.replace("/app/board/", "/app/live-embed/");
      const embedUrl = `${normalizedUrl.origin}${livePath}${normalizedUrl.search}`;

      return {
        provider: "miro",
        providerLabel: "Miro",
        embedUrl,
        sourceUrl,
        height: clampHeight(preferredHeight ?? 600),
        helpText: "Boards publicas ou com permissao de visualizacao funcionam melhor no embed.",
      };
    }
  }

  if (host.endsWith("notion.site") || host.endsWith("notion.so") || host.endsWith("notion.com")) {
    return {
      provider: "notion",
      providerLabel: "Notion",
      embedUrl: sourceUrl,
      sourceUrl,
      height: clampHeight(preferredHeight ?? 640),
      helpText: "Use o link publicado do site ou cole o iframe copiado em 'Embed this page'.",
    };
  }

  const youTubeVideoId = matchYouTubeVideoId(normalizedUrl);
  if (youTubeVideoId) {
    return {
      provider: "youtube",
      providerLabel: "YouTube",
      embedUrl: `https://www.youtube.com/embed/${youTubeVideoId}`,
      sourceUrl,
      height: clampHeight(preferredHeight ?? 420),
    };
  }

  const vimeoVideoId = matchVimeoVideoId(normalizedUrl);
  if (vimeoVideoId) {
    return {
      provider: "vimeo",
      providerLabel: "Vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoVideoId}`,
      sourceUrl,
      height: clampHeight(preferredHeight ?? 420),
    };
  }

  const loomVideoId = matchLoomVideoId(normalizedUrl);
  if (loomVideoId) {
    return {
      provider: "loom",
      providerLabel: "Loom",
      embedUrl: `https://www.loom.com/embed/${loomVideoId}`,
      sourceUrl,
      height: clampHeight(preferredHeight ?? 420),
    };
  }

  return {
    provider: "generic",
    providerLabel: host.split(".")[0] || "Embed",
    embedUrl: sourceUrl,
    sourceUrl,
    height: clampHeight(preferredHeight ?? 520),
    helpText: "Se o provider bloquear iframe, cole a URL de embed ou o codigo completo do iframe.",
  };
}

export function ContentEmbed({
  block,
  preview = false,
  showCaption = true,
}: {
  block: EmbedBlock;
  preview?: boolean;
  showCaption?: boolean;
}) {
  const resolved = resolveEmbed(block.url, block.height);
  const frameHeight = preview ? Math.min(resolved.height, 420) : resolved.height;

  if (!resolved.embedUrl || !resolved.sourceUrl) {
    return (
      <div
        className="rounded-xl px-5 py-8 text-center"
        style={{
          backgroundColor: preview ? "#141414" : "var(--bg-secondary, #0F1012)",
          border: preview ? "1px dashed #2a2a2a" : "1px solid var(--border-primary, #2A2A2A)",
        }}
      >
        <span className="block text-[#666]" style={{ fontSize: "13px" }}>
          Cole um link publico ou o iframe do Figma, Notion, Miro e similares.
        </span>
      </div>
    );
  }

  return (
    <figure className={preview ? "my-6" : "my-8"}>
      <div
        className="overflow-hidden rounded-xl"
        style={{
          backgroundColor: preview ? "#101010" : "var(--bg-secondary, #0F1012)",
          border: preview ? "1px solid #1e1e1e" : "1px solid var(--border-primary, #2A2A2A)",
        }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-2 px-4 py-2"
          style={{ borderBottom: preview ? "1px solid #1e1e1e" : "1px solid var(--border-primary, #2A2A2A)" }}
        >
          <span
            className="inline-flex items-center rounded-full px-2.5 py-1"
            style={{
              fontSize: "11px",
              lineHeight: "14px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              backgroundColor: preview ? "#181818" : "var(--bg-primary, #111111)",
              color: preview ? "#888" : "var(--text-secondary, #6f6f6f)",
            }}
          >
            {resolved.providerLabel}
          </span>
          <a
            href={resolved.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-opacity hover:opacity-80"
            style={{ fontSize: "12px", color: preview ? "#888" : "var(--text-secondary, #6f6f6f)" }}
          >
            <ExternalLink size={13} />
            Abrir original
          </a>
        </div>
        <iframe
          src={resolved.embedUrl}
          title={richTextToPlainText(block.caption) || `${resolved.providerLabel} embed`}
          className="w-full"
          style={{ height: `${frameHeight}px`, border: "none", backgroundColor: preview ? "#0d0d0d" : "transparent" }}
          loading="lazy"
          allow={DEFAULT_EMBED_ALLOW}
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      {showCaption && block.caption && (
        <figcaption
          className="mt-2 text-center font-['Inter',sans-serif]"
          style={{ fontSize: "13px", color: preview ? "#666" : "var(--text-secondary, #6f6f6f)" }}
        >
          <RichTextContent value={block.caption} />
        </figcaption>
      )}
    </figure>
  );
}
