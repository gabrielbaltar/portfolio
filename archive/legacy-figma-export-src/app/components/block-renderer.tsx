import { type ContentBlock } from "./cms-data";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { VideoPlayer } from "./video-player";

/** Check if a URL points to an SVG */
function isSvg(url: string): boolean {
  if (!url) return false;
  return url.toLowerCase().endsWith(".svg") || url.startsWith("data:image/svg+xml");
}

/** Check if a URL points to a GIF */
function isGif(url: string): boolean {
  if (!url) return false;
  return url.toLowerCase().endsWith(".gif") || url.startsWith("data:image/gif");
}

export function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading1":
            return (
              <h1
                key={i}
                className="font-['Inter',sans-serif] mt-8 first:mt-0"
                style={{ fontSize: "24px", lineHeight: "32px", color: "var(--text-primary, #fafafa)" }}
              >
                {block.text}
              </h1>
            );
          case "heading2":
            return (
              <h2
                key={i}
                className="font-['Inter',sans-serif] mt-6 first:mt-0"
                style={{ fontSize: "20px", lineHeight: "28px", color: "var(--text-primary, #fafafa)" }}
              >
                {block.text}
              </h2>
            );
          case "heading3":
            return (
              <h3
                key={i}
                className="font-['Inter',sans-serif] mt-4 first:mt-0"
                style={{ fontSize: "17px", lineHeight: "24px", color: "var(--text-primary, #fafafa)" }}
              >
                {block.text}
              </h3>
            );
          case "paragraph":
            return (
              <p
                key={i}
                className="font-['Inter',sans-serif]"
                style={{ fontSize: "15px", lineHeight: "26px", color: "var(--text-secondary, #a6a6a6)" }}
              >
                {block.text}
              </p>
            );
          case "unordered-list":
            return (
              <ul key={i} className="pl-5 space-y-1.5" style={{ listStyleType: "disc" }}>
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="font-['Inter',sans-serif]"
                    style={{ fontSize: "15px", lineHeight: "24px", color: "var(--text-secondary, #a6a6a6)" }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            );
          case "ordered-list":
            return (
              <ol key={i} className="pl-5 space-y-1.5" style={{ listStyleType: "decimal" }}>
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="font-['Inter',sans-serif]"
                    style={{ fontSize: "15px", lineHeight: "24px", color: "var(--text-secondary, #a6a6a6)" }}
                  >
                    {item}
                  </li>
                ))}
              </ol>
            );
          case "image": {
            if (!block.url) return null;
            const svg = isSvg(block.url);
            const gif = isGif(block.url);
            const radius = block.borderRadius != null ? `${block.borderRadius}px` : "0px";
            return (
              <figure key={i} className="my-6">
                {svg ? (
                  <img
                    src={block.url}
                    alt={block.caption || ""}
                    className="mx-auto"
                    style={{ maxHeight: "525px", maxWidth: "100%", objectFit: "contain", borderRadius: radius }}
                  />
                ) : gif ? (
                  <img
                    src={block.url}
                    alt={block.caption || ""}
                    className="w-full object-cover"
                    style={{ height: "525px", maxHeight: "525px", objectPosition: block.position || "50% 50%", borderRadius: radius }}
                  />
                ) : (
                  <ImageWithFallback
                    src={block.url}
                    alt={block.caption || ""}
                    className="w-full object-cover"
                    style={{ height: "525px", maxHeight: "525px", objectPosition: block.position || "50% 50%", borderRadius: radius }}
                  />
                )}
                {block.caption && (
                  <figcaption
                    className="mt-2 text-center font-['Inter',sans-serif]"
                    style={{ fontSize: "13px", color: "var(--text-secondary, #6f6f6f)" }}
                  >
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }
          case "video": {
            if (!block.url) return null;
            const vRadius = block.borderRadius != null ? block.borderRadius : 0;
            return (
              <figure key={i} className="my-6">
                <div style={{ borderRadius: `${vRadius}px`, overflow: "hidden" }}>
                  <VideoPlayer
                    src={block.url}
                    poster={block.poster || undefined}
                    caption={block.caption || undefined}
                    autoPlay={block.autoplay || false}
                    loop={block.loop || false}
                    muted={block.muted || block.autoplay || false}
                    height={525}
                    borderRadius={vRadius}
                  />
                </div>
              </figure>
            );
          }
          case "divider":
            return (
              <hr
                key={i}
                className="my-8"
                style={{ borderColor: "var(--border-primary, #2A2A2A)" }}
              />
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-2 pl-4 py-2 my-6"
                style={{ borderColor: "var(--accent-green, #00ff3c)" }}
              >
                <p
                  className="font-['Inter',sans-serif] italic"
                  style={{ fontSize: "16px", lineHeight: "28px", color: "var(--text-primary, #fafafa)" }}
                >
                  {(block as any).text}
                </p>
                {(block as any).author && (
                  <cite
                    className="font-['Inter',sans-serif] not-italic block mt-2"
                    style={{ fontSize: "13px", color: "var(--text-secondary, #a6a6a6)" }}
                  >
                    — {(block as any).author}
                  </cite>
                )}
              </blockquote>
            );
          case "cta":
            return (
              <div
                key={i}
                className="rounded-xl p-6 text-center my-6"
                style={{
                  backgroundColor: "var(--bg-secondary, #0F1012)",
                  border: "1px solid var(--border-primary, #2A2A2A)",
                }}
              >
                <p
                  className="font-['Inter',sans-serif] mb-4"
                  style={{ fontSize: "16px", lineHeight: "26px", color: "var(--text-primary, #fafafa)" }}
                >
                  {(block as any).text}
                </p>
                {(block as any).buttonUrl ? (
                  <a
                    href={(block as any).buttonUrl}
                    target={(block as any).openInNewTab !== false ? "_blank" : "_self"}
                    rel={(block as any).openInNewTab !== false ? "noopener noreferrer" : undefined}
                    className="inline-block px-5 py-2.5 rounded-lg font-['Inter',sans-serif] cursor-pointer transition-opacity hover:opacity-90"
                    style={{
                      fontSize: "14px",
                      backgroundColor: "var(--btn-primary-bg, #fafafa)",
                      color: "var(--btn-primary-text, #111)",
                    }}
                  >
                    {(block as any).buttonText || "Saiba mais"}
                  </a>
                ) : (
                  <button
                    className="inline-block px-5 py-2.5 rounded-lg font-['Inter',sans-serif] cursor-pointer transition-opacity hover:opacity-90"
                    style={{
                      fontSize: "14px",
                      backgroundColor: "var(--btn-primary-bg, #fafafa)",
                      color: "var(--btn-primary-text, #111)",
                      border: "none",
                    }}
                  >
                    {(block as any).buttonText || "Saiba mais"}
                  </button>
                )}
              </div>
            );
          case "embed":
            return (
              <figure key={i} className="my-6">
                <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--bg-secondary, #0F1012)", border: "1px solid var(--border-primary, #2A2A2A)" }}>
                  <iframe
                    src={(block as any).url}
                    className="w-full"
                    style={{ height: "400px", border: "none" }}
                    title={(block as any).caption || "Embed"}
                    allowFullScreen
                  />
                </div>
                {(block as any).caption && (
                  <figcaption
                    className="mt-2 text-center font-['Inter',sans-serif]"
                    style={{ fontSize: "13px", color: "var(--text-secondary, #6f6f6f)" }}
                  >
                    {(block as any).caption}
                  </figcaption>
                )}
              </figure>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}