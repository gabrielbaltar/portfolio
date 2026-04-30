import { useEffect, useState, type CSSProperties } from "react";
import { Check, Copy } from "lucide-react";
import { type ContentBlock } from "./cms-data";
import type { ContentListItem } from "@portfolio/core";
import { VideoPlayer } from "./video-player";
import { getBlockLineHeight, getCodeLanguageLabel, isAdjustableLineHeightBlock } from "./content-block-utils";
import { CodeHighlight } from "./code-highlight";
import { canOpenInImageLightbox, ContentImage } from "./content-image";
import { ContentEmbed } from "./content-embed";
import { getLightboxOriginRect, type LightboxOpenPayload } from "./image-lightbox";
import { RichTextContent, richTextToPlainText } from "./rich-text";
import { ShowcaseBlockView, isShowcaseBlock } from "./showcase-blocks";
import { PreviewMediaSlider } from "./content-preview-cards";

function getDividerSpacing(block: Extract<ContentBlock, { type: "divider" }>) {
  return Math.max(24, Math.min(160, block.spacing ?? 72));
}

function isDividerHidden(block: Extract<ContentBlock, { type: "divider" }>) {
  return block.variant === "hidden";
}

const UNORDERED_LIST_STYLE_TYPES = ["disc", "circle", "square"] as const;
const ORDERED_LIST_STYLE_TYPES = ["decimal", "lower-alpha", "lower-roman"] as const;

function getListStyleType(ordered: boolean, depth: number) {
  const styles = ordered ? ORDERED_LIST_STYLE_TYPES : UNORDERED_LIST_STYLE_TYPES;
  return styles[depth % styles.length];
}

function sanitizeHexColor(value?: string | null) {
  const normalized = (value || "").trim();
  if (!normalized) return undefined;
  if (/^#[\da-f]{3}$/i.test(normalized) || /^#[\da-f]{6}$/i.test(normalized)) return normalized;
  return undefined;
}

function getResponsiveHeading1Style(lineHeight?: number | null) {
  const resolvedLineHeight = lineHeight ?? 32;

  return {
    "--responsive-font-size": "24px",
    "--responsive-line-height": `${resolvedLineHeight}px`,
    "--responsive-tablet-font-size": "22px",
    "--responsive-tablet-line-height": `${Math.min(resolvedLineHeight, 30)}px`,
    "--responsive-mobile-font-size": "20px",
    "--responsive-mobile-line-height": `${Math.min(resolvedLineHeight, 28)}px`,
    color: "var(--text-primary, #fafafa)",
  } as CSSProperties & {
    "--responsive-font-size": string;
    "--responsive-line-height": string;
    "--responsive-tablet-font-size": string;
    "--responsive-tablet-line-height": string;
    "--responsive-mobile-font-size": string;
    "--responsive-mobile-line-height": string;
  };
}

function ListBlockView({
  items,
  ordered,
  lineHeight,
  depth = 0,
}: {
  items: ContentListItem[];
  ordered: boolean;
  lineHeight: number;
  depth?: number;
}) {
  const ListTag = ordered ? "ol" : "ul";

  if (!items.length) return null;

  return (
    <ListTag
      className={depth === 0 ? "pl-5 space-y-1.5" : "mt-2 pl-5 space-y-1.5"}
      style={{ listStyleType: getListStyleType(ordered, depth) }}
    >
      {items.map((item, index) => (
        <li
          key={`${depth}-${index}-${item.text}`}
          className="font-['Inter',sans-serif]"
          style={{ fontSize: "15px", lineHeight: `${lineHeight}px`, color: "var(--text-secondary, #a6a6a6)" }}
        >
          <RichTextContent value={item.text} />
          {(item.children ?? []).length > 0 && (
            <ListBlockView
              items={item.children ?? []}
              ordered={ordered}
              lineHeight={lineHeight}
              depth={depth + 1}
            />
          )}
        </li>
      ))}
    </ListTag>
  );
}

function CodeBlockView({ block }: { block: Extract<ContentBlock, { type: "code" }> }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeoutId = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  async function handleCopy() {
    if (!block.code) return;

    try {
      await navigator.clipboard.writeText(block.code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <figure className="my-8">
      <div
        className="overflow-hidden rounded-xl"
        style={{
          backgroundColor: "var(--bg-secondary, #0F1012)",
          border: "1px solid var(--border-primary, #2A2A2A)",
        }}
      >
        <div
          className="flex items-center justify-between gap-3 px-4 py-2"
          style={{ borderBottom: "1px solid var(--border-primary, #2A2A2A)" }}
        >
          <span
            className="font-['Inter',sans-serif]"
            style={{ fontSize: "11px", lineHeight: "16px", color: "var(--text-secondary, #6f6f6f)", textTransform: "uppercase", letterSpacing: "0.5px" }}
          >
            {getCodeLanguageLabel(block.language)}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!block.code}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-opacity"
            style={{
              backgroundColor: "var(--bg-primary, #111111)",
              border: "1px solid var(--border-primary, #2A2A2A)",
              color: "var(--text-primary, #fafafa)",
              opacity: block.code ? 1 : 0.45,
              cursor: block.code ? "pointer" : "not-allowed",
              fontSize: "12px",
              lineHeight: "16px",
            }}
            aria-label={copied ? "Codigo copiado" : "Copiar codigo"}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "Copiado" : "Copiar"}</span>
          </button>
        </div>
        <CodeHighlight code={block.code} language={block.language} maxHeight={500} />
      </div>
      {block.caption && (
        <figcaption
          className="mt-2 text-center font-['Inter',sans-serif]"
          style={{ fontSize: "13px", color: "var(--text-secondary, #6f6f6f)" }}
        >
          <RichTextContent value={block.caption} />
        </figcaption>
      )}
    </figure>
  );
}

function CardsBlockView({ block }: { block: Extract<ContentBlock, { type: "cards" }> }) {
  const visibleCards = (block.cards || []).filter((card) =>
    Boolean(
      card.image?.trim() ||
      card.title?.trim() ||
      card.description?.trim() ||
      card.ctaText?.trim() ||
      card.ctaUrl?.trim(),
    ),
  );

  if (visibleCards.length === 0) return null;

  return (
    <div className="my-8 grid grid-cols-1 gap-4 min-[720px]:grid-cols-2 min-[1060px]:grid-cols-3">
      {visibleCards.map((card, cardIndex) => {
        const backgroundColor = sanitizeHexColor(card.backgroundColor) || "var(--bg-secondary, #0F1012)";
        const borderColor = sanitizeHexColor(card.borderColor) || "var(--border-primary, #2A2A2A)";
        const hasCta = Boolean(card.ctaText?.trim() || card.ctaUrl?.trim());
        const ctaLabel = card.ctaText?.trim() || "Saiba mais";
        const ctaContent = <RichTextContent value={ctaLabel} />;

        return (
          <article
            key={cardIndex}
            className="flex min-w-0 flex-col overflow-hidden rounded-lg"
            style={{ backgroundColor, border: `1px solid ${borderColor}` }}
          >
            {card.image?.trim() ? (
              <ContentImage
                src={card.image}
                alt={richTextToPlainText(card.title || "")}
                className="w-full object-cover"
                position={card.imagePosition || "50% 50%"}
                style={{ aspectRatio: "16 / 10" }}
              />
            ) : null}
            {(card.title?.trim() || card.description?.trim() || hasCta) ? (
              <div className="flex flex-1 flex-col gap-3 p-5">
                {card.title?.trim() ? (
                  <h3
                    className="font-['Inter',sans-serif]"
                    style={{ fontSize: "17px", lineHeight: "24px", color: "var(--text-primary, #fafafa)" }}
                  >
                    <RichTextContent value={card.title} />
                  </h3>
                ) : null}
                {card.description?.trim() ? (
                  <p
                    className="font-['Inter',sans-serif]"
                    style={{ fontSize: "14px", lineHeight: "22px", color: "var(--text-secondary, #a6a6a6)" }}
                  >
                    <RichTextContent value={card.description} />
                  </p>
                ) : null}
                {hasCta ? (
                  <div className="mt-auto pt-1">
                    {card.ctaUrl?.trim() ? (
                      <a
                        href={card.ctaUrl}
                        target={card.openInNewTab !== false ? "_blank" : "_self"}
                        rel={card.openInNewTab !== false ? "noopener noreferrer" : undefined}
                        className="inline-flex min-h-9 items-center rounded-md px-3 py-2 font-['Inter',sans-serif] transition-opacity hover:opacity-85"
                        style={{ fontSize: "13px", lineHeight: "17px", backgroundColor: "var(--btn-primary-bg, #fafafa)", color: "var(--btn-primary-text, #111)" }}
                      >
                        {ctaContent}
                      </a>
                    ) : (
                      <span
                        className="inline-flex min-h-9 items-center rounded-md px-3 py-2 font-['Inter',sans-serif]"
                        style={{ fontSize: "13px", lineHeight: "17px", backgroundColor: "var(--btn-primary-bg, #fafafa)", color: "var(--btn-primary-text, #111)" }}
                      >
                        {ctaContent}
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function TableBlockView({ block }: { block: Extract<ContentBlock, { type: "table" }> }) {
  const columns = (block.columns || []).map((column) => column.trim()).filter(Boolean);
  const normalizedColumns = columns.length > 0 ? columns : ["Coluna 1", "Coluna 2"];
  const rows = (block.rows || [])
    .map((row) => normalizedColumns.map((_, columnIndex) => row[columnIndex] || ""))
    .filter((row) => row.some((cell) => cell.trim() !== ""));

  if (rows.length === 0) return null;

  return (
    <figure className="my-8">
      <div
        className="relative overflow-hidden rounded-lg"
        style={{
          backgroundColor: "transparent",
          border: "1px solid var(--border-primary, #3A3A3A)",
        }}
      >
        <div className="hidden min-[560px]:block overflow-x-auto">
          <table className="w-full min-w-[520px] table-fixed border-collapse font-['Inter',sans-serif]">
            <thead>
              <tr>
                {normalizedColumns.map((column, columnIndex) => (
                  <th
                    key={columnIndex}
                    className="border-b px-4 py-4 text-left font-semibold"
                    style={{
                      borderColor: "var(--border-primary, #3A3A3A)",
                      color: "var(--text-primary, #fafafa)",
                      fontSize: "17px",
                      lineHeight: "23px",
                    }}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {normalizedColumns.map((_, columnIndex) => (
                    <td
                      key={columnIndex}
                      className="border-b px-4 py-5 align-top last:border-b"
                      style={{
                        borderColor: "color-mix(in srgb, var(--border-primary, #3A3A3A) 62%, transparent)",
                        color: "var(--text-primary, #f3f3f3)",
                        fontSize: "16px",
                        lineHeight: "24px",
                        fontWeight: 400,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {row[columnIndex]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="min-[560px]:hidden">
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="space-y-4 p-4"
              style={{ borderTop: rowIndex === 0 ? undefined : "1px solid var(--border-primary, #3A3A3A)" }}
            >
              {normalizedColumns.map((column, columnIndex) => (
                <div key={columnIndex} className="min-w-0">
                  <div
                    className="mb-1 font-['Inter',sans-serif] font-semibold"
                    style={{ fontSize: "12px", lineHeight: "16px", color: "var(--text-secondary, #a6a6a6)" }}
                  >
                    {column}
                  </div>
                  <div
                    className="break-words font-['Inter',sans-serif]"
                    style={{ fontSize: "15px", lineHeight: "22px", color: "var(--text-primary, #fafafa)", fontWeight: 400, whiteSpace: "pre-wrap" }}
                  >
                    {row[columnIndex]}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {block.caption?.trim() ? (
        <figcaption
          className="mt-2 text-center font-['Inter',sans-serif]"
          style={{ fontSize: "13px", lineHeight: "18px", color: "var(--text-secondary, #6f6f6f)" }}
        >
          {block.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function ImageBlockSlider({
  block,
  alt,
  imagesClickable,
  onImageClick,
}: {
  block: Extract<ContentBlock, { type: "image" }>;
  alt: string;
  imagesClickable: boolean;
  onImageClick?: (payload: LightboxOpenPayload) => void;
}) {
  const radius = block.borderRadius != null ? `${block.borderRadius}px` : "0px";

  return (
    <PreviewMediaSlider
      title={alt || "Imagem"}
      image={block.url}
      imagePosition={block.position || "50% 50%"}
      galleryImages={block.galleryImages || []}
      galleryPositions={block.galleryPositions || []}
      aspectRatio="4 / 3"
      frameClassName="rounded-xl"
      frameStyle={{ borderRadius: radius }}
      imageClassName={imagesClickable ? "cursor-pointer" : ""}
      disablePointerEvents={!imagesClickable}
      onImageClick={imagesClickable ? onImageClick : undefined}
      emptyLabel="Sem imagem"
    />
  );
}

export function BlockRenderer({
  blocks,
  imagesClickable = false,
  onImageClick,
  summaryAnchors,
}: {
  blocks: ContentBlock[];
  imagesClickable?: boolean;
  onImageClick?: (payload: LightboxOpenPayload) => void;
  summaryAnchors?: Record<number, { id: string }>;
}) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-8">
      {blocks.map((block, i) => {
        const blockLineHeight = isAdjustableLineHeightBlock(block) ? getBlockLineHeight(block) : null;
        const summaryAnchor = summaryAnchors?.[i];

        if (isShowcaseBlock(block)) {
          if (!summaryAnchor) {
            return <ShowcaseBlockView key={i} block={block} variant="public" />;
          }

          return (
            <section key={i} id={summaryAnchor.id} style={{ scrollMarginTop: "132px" }}>
              <ShowcaseBlockView block={block} variant="public" />
            </section>
          );
        }

        switch (block.type) {
          case "heading1":
            return (
              <h1
                key={i}
                id={summaryAnchor?.id}
                className="responsive-content-h1 font-['Inter',sans-serif] mt-10 first:mt-0"
                style={{
                  ...getResponsiveHeading1Style(blockLineHeight),
                  scrollMarginTop: summaryAnchor ? "132px" : undefined,
                }}
              >
                <RichTextContent value={block.text} />
              </h1>
            );
          case "heading2":
            return (
              <h2
                key={i}
                id={summaryAnchor?.id}
                className="font-['Inter',sans-serif] mt-8 first:mt-0"
                style={{
                  fontSize: "20px",
                  lineHeight: blockLineHeight ? `${blockLineHeight}px` : "28px",
                  color: "var(--text-primary, #fafafa)",
                  scrollMarginTop: summaryAnchor ? "132px" : undefined,
                }}
              >
                <RichTextContent value={block.text} />
              </h2>
            );
          case "heading3":
            return (
              <h3
                key={i}
                id={summaryAnchor?.id}
                className="font-['Inter',sans-serif] mt-6 first:mt-0"
                style={{
                  fontSize: "17px",
                  lineHeight: blockLineHeight ? `${blockLineHeight}px` : "24px",
                  color: "var(--text-primary, #fafafa)",
                  scrollMarginTop: summaryAnchor ? "132px" : undefined,
                }}
              >
                <RichTextContent value={block.text} />
              </h3>
            );
          case "paragraph":
            return (
              <p
                key={i}
                className="font-['Inter',sans-serif]"
                style={{ fontSize: "15px", lineHeight: blockLineHeight ? `${blockLineHeight}px` : "26px", color: "var(--text-secondary, #a6a6a6)" }}
              >
                <RichTextContent value={block.text} />
              </p>
            );
          case "unordered-list":
            return <ListBlockView key={i} items={block.items} ordered={false} lineHeight={blockLineHeight || 24} />;
          case "ordered-list":
            return <ListBlockView key={i} items={block.items} ordered lineHeight={blockLineHeight || 24} />;
          case "table":
            return <TableBlockView key={i} block={block} />;
          case "code":
            return <CodeBlockView key={i} block={block} />;
          case "image": {
            const hasGallery = (block.galleryImages || []).filter(Boolean).length > 0;
            if (!block.url && !hasGallery) return null;
            const radius = block.borderRadius != null ? `${block.borderRadius}px` : "0px";
            const alt = richTextToPlainText(block.caption) || "";
            const imageClassName = imagesClickable ? "cursor-pointer" : undefined;
            const openImage: React.MouseEventHandler<HTMLElement> = (event) => {
              if (!imagesClickable || !onImageClick || !canOpenInImageLightbox(block.url)) return;
              onImageClick({
                slides: [{
                  src: block.url,
                  alt,
                  originRect: getLightboxOriginRect(event.currentTarget),
                }],
                index: 0,
              });
            };
            return (
              <figure key={i} className="my-8">
                {hasGallery ? (
                  <ImageBlockSlider
                    block={block}
                    alt={alt}
                    imagesClickable={imagesClickable}
                    onImageClick={onImageClick}
                  />
                ) : (
                  imagesClickable && canOpenInImageLightbox(block.url) ? (
                    <button
                      type="button"
                      onClick={openImage}
                      className="block w-full border-none bg-transparent p-0 text-left"
                      style={{ cursor: "pointer", borderRadius: radius }}
                      aria-label={alt ? `Ampliar imagem: ${alt}` : "Ampliar imagem"}
                    >
                      <ContentImage
                        src={block.url}
                        alt={alt}
                        className={`w-full object-cover ${imageClassName || ""}`}
                        style={{ height: "525px", maxHeight: "525px", objectPosition: block.position || "50% 50%", borderRadius: radius }}
                      />
                    </button>
                  ) : (
                    <ContentImage
                      src={block.url}
                      alt={alt}
                      className={`w-full object-cover ${imageClassName || ""}`}
                      style={{ height: "525px", maxHeight: "525px", objectPosition: block.position || "50% 50%", borderRadius: radius }}
                    />
                  )
                )}
                {block.caption && (
                  <figcaption
                    className="mt-2 text-center font-['Inter',sans-serif]"
                    style={{ fontSize: "13px", color: "var(--text-secondary, #6f6f6f)" }}
                  >
                    <RichTextContent value={block.caption} />
                  </figcaption>
                )}
              </figure>
            );
          }
          case "video": {
            if (!block.url) return null;
            const vRadius = block.borderRadius != null ? block.borderRadius : 0;
            return (
              <figure key={i} className="my-8">
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
                    fit={block.fit || "contain"}
                    zoom={block.zoom ?? 1}
                  />
                </div>
              </figure>
            );
          }
          case "divider":
            return (
              <hr
                key={i}
                style={{
                  borderColor: isDividerHidden(block) ? "transparent" : "var(--border-primary, #2A2A2A)",
                  marginTop: `${getDividerSpacing(block)}px`,
                  marginBottom: `${getDividerSpacing(block)}px`,
                }}
              />
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-2 pl-4 py-2 my-8"
                style={{ borderColor: sanitizeHexColor(block.accentColor) || "var(--accent-green, #00ff3c)" }}
              >
                <p
                  className="font-['Inter',sans-serif] italic"
                  style={{ fontSize: "16px", lineHeight: blockLineHeight ? `${blockLineHeight}px` : "28px", color: "var(--text-primary, #fafafa)" }}
                >
                  <RichTextContent value={(block as any).text} />
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
                className="rounded-xl p-6 text-center my-8"
                style={{
                  backgroundColor: "var(--bg-secondary, #0F1012)",
                  border: "1px solid var(--border-primary, #2A2A2A)",
                }}
              >
                <p
                  className="font-['Inter',sans-serif] mb-4"
                  style={{ fontSize: "16px", lineHeight: blockLineHeight ? `${blockLineHeight}px` : "26px", color: "var(--text-primary, #fafafa)" }}
                >
                  <RichTextContent value={(block as any).text} />
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
                    <RichTextContent value={(block as any).buttonText || "Saiba mais"} />
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
                    <RichTextContent value={(block as any).buttonText || "Saiba mais"} />
                  </button>
                )}
              </div>
            );
          case "cards":
            return <CardsBlockView key={i} block={block} />;
          case "embed":
            return <ContentEmbed key={i} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
