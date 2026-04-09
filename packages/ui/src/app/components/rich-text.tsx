import {
  ArrowRight,
  Bold,
  Check,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Languages,
  Link2,
  List,
  ListOrdered,
  Palette,
  Sparkles,
  Star,
  Tags,
  Underline,
  Unlink,
  Zap,
} from "lucide-react";
import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { type Theme, useTheme } from "./theme-context";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const INLINE_ICON_COMPONENTS = {
  star: Star,
  sparkles: Sparkles,
  check: Check,
  "arrow-right": ArrowRight,
  zap: Zap,
} as const;

export type InlineIconName = keyof typeof INLINE_ICON_COMPONENTS;

const INLINE_ICON_TEXT: Record<InlineIconName, string> = {
  star: "★",
  sparkles: "✦",
  check: "✓",
  "arrow-right": "→",
  zap: "⚡",
};

const INLINE_ICON_LABELS: Record<InlineIconName, string> = {
  star: "Estrela",
  sparkles: "Sparkles",
  check: "Check",
  "arrow-right": "Seta",
  zap: "Raio",
};

const INLINE_TEXT_COLORS = [
  { label: "Padrao", value: "inherit", swatch: "linear-gradient(135deg, #fafafa 0%, #7a7a7a 100%)" },
  { label: "Neutro", value: "#f5f5f5", swatch: "#f5f5f5" },
  { label: "Verde", value: "#8CF5AE", swatch: "#8CF5AE" },
  { label: "Turquesa", value: "#7EE7E5", swatch: "#7EE7E5" },
  { label: "Azul", value: "#72B9FF", swatch: "#72B9FF" },
  { label: "Lilás", value: "#B8A1FF", swatch: "#B8A1FF" },
  { label: "Rosa", value: "#F0A6FF", swatch: "#F0A6FF" },
  { label: "Pêssego", value: "#FFC38A", swatch: "#FFC38A" },
  { label: "Amarelo", value: "#FFE480", swatch: "#FFE480" },
  { label: "Vermelho", value: "#FF9E9E", swatch: "#FF9E9E" },
] as const;

const INLINE_FONT_SIZE_OPTIONS = [
  { label: "Padrao", value: "inherit" },
  { label: "13px", value: "13px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "22px", value: "22px" },
  { label: "28px", value: "28px" },
  { label: "36px", value: "36px" },
  { label: "48px", value: "48px" },
  { label: "72px", value: "72px" },
] as const;

const INLINE_LINE_HEIGHT_OPTIONS = [
  { label: "Padrao", value: "inherit" },
  { label: "1.1x", value: "1.1" },
  { label: "1.3x", value: "1.3" },
  { label: "1.5x", value: "1.5" },
  { label: "1.7x", value: "1.7" },
  { label: "2.0x", value: "2" },
  { label: "2.4x", value: "2.4" },
] as const;

const RICH_TEXT_BLOCK_TAGS = new Set(["div", "p", "h1", "h2", "h3", "ul", "ol", "li"]);
const RICH_TEXT_LINE_HEIGHT_BLOCK_SELECTOR = "div, p, h1, h2, h3, li";
const RICH_TEXT_BREAK_HTML = '<br data-rich-text-break="true">';

function normalizeInlineTagLabel(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isBlockTag(tagName: string) {
  return RICH_TEXT_BLOCK_TAGS.has(tagName);
}

function isSafeUrl(value: string) {
  if (!value) return false;
  return /^(https?:|mailto:|tel:|\/|#)/i.test(value.trim());
}

function sanitizeInlineColor(value?: string | null) {
  const normalized = value?.trim();
  if (!normalized) return null;
  if (normalized === "inherit") return normalized;
  if (/^#[\da-f]{6}$/i.test(normalized) || /^#[\da-f]{3}$/i.test(normalized)) return normalized;
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i.test(normalized)) return normalized;
  return null;
}

function sanitizeInlineFontSize(value?: string | null) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "inherit") return normalized;
  if (!/^\d+px$/.test(normalized)) return null;
  const size = Number.parseInt(normalized, 10);
  if (Number.isNaN(size) || size < 10 || size > 96) return null;
  return `${size}px`;
}

function sanitizeInlineLineHeight(value?: string | null) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "inherit") return normalized;
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const lineHeight = Number.parseFloat(normalized);
  if (Number.isNaN(lineHeight) || lineHeight < 0.9 || lineHeight > 3) return null;
  return `${lineHeight}`;
}

function parseInlineRgbColor(value: string) {
  const normalized = sanitizeInlineColor(value);
  if (!normalized || normalized === "inherit") return null;

  if (normalized.startsWith("#")) {
    const hex = normalized.slice(1);
    if (hex.length === 3) {
      return {
        r: Number.parseInt(hex[0] + hex[0], 16),
        g: Number.parseInt(hex[1] + hex[1], 16),
        b: Number.parseInt(hex[2] + hex[2], 16),
      };
    }

    if (hex.length === 6) {
      return {
        r: Number.parseInt(hex.slice(0, 2), 16),
        g: Number.parseInt(hex.slice(2, 4), 16),
        b: Number.parseInt(hex.slice(4, 6), 16),
      };
    }

    return null;
  }

  const match = normalized.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!match) return null;

  return {
    r: Number.parseInt(match[1], 10),
    g: Number.parseInt(match[2], 10),
    b: Number.parseInt(match[3], 10),
  };
}

function toRelativeLuminanceChannel(channel: number) {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function getRelativeLuminance(color: { r: number; g: number; b: number }) {
  return (
    0.2126 * toRelativeLuminanceChannel(color.r) +
    0.7152 * toRelativeLuminanceChannel(color.g) +
    0.0722 * toRelativeLuminanceChannel(color.b)
  );
}

function resolveThemeAwareInlineColor(color: string | null, theme: Theme) {
  if (!color || color === "inherit" || theme !== "light") return color || undefined;

  const parsedColor = parseInlineRgbColor(color);
  if (!parsedColor) return color;

  const channelSpread = Math.max(parsedColor.r, parsedColor.g, parsedColor.b) - Math.min(parsedColor.r, parsedColor.g, parsedColor.b);
  const isNearNeutral = channelSpread <= 18;
  const isVeryLight = getRelativeLuminance(parsedColor) >= 0.88;

  if (isNearNeutral && isVeryLight) {
    return "var(--text-primary, #111111)";
  }

  return color;
}

function appendNode(target: HTMLElement, node: Node) {
  target.appendChild(node);
}

function appendChildren(source: Node, target: HTMLElement, doc: Document) {
  Array.from(source.childNodes).forEach((child) => sanitizeNode(child, target, doc));
}

function sanitizeNode(node: Node, target: HTMLElement, doc: Document) {
  if (node.nodeType === Node.TEXT_NODE) {
    appendNode(target, doc.createTextNode(node.textContent ?? ""));
    return;
  }

  if (!(node instanceof HTMLElement)) return;

  const tagName = node.tagName.toLowerCase();

  if (tagName === "br") {
    const lineBreak = doc.createElement("br");
    lineBreak.setAttribute("data-rich-text-break", "true");
    appendNode(target, lineBreak);
    return;
  }

  if (isBlockTag(tagName)) {
    const el = doc.createElement(tagName);
    const blockLineHeight = sanitizeInlineLineHeight(node.style.lineHeight);
    if (blockLineHeight) el.style.lineHeight = blockLineHeight;
    appendChildren(node, el, doc);
    appendNode(target, el);
    return;
  }

  if (tagName === "strong" || tagName === "b" || tagName === "em" || tagName === "i" || tagName === "u") {
    const el = doc.createElement(tagName === "b" ? "strong" : tagName === "i" ? "em" : tagName);
    appendChildren(node, el, doc);
    appendNode(target, el);
    return;
  }

  if (tagName === "a") {
    const href = node.getAttribute("href")?.trim() || "";
    if (!isSafeUrl(href)) {
      appendChildren(node, target, doc);
      return;
    }
    const link = doc.createElement("a");
    link.setAttribute("href", href);
    if (/^https?:/i.test(href)) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
    appendChildren(node, link, doc);
    appendNode(target, link);
    return;
  }

  if (tagName === "span") {
    const inlineTagLabel = node.dataset.inlineTag
      ? normalizeInlineTagLabel(node.dataset.inlineTagLabel || node.textContent || "")
      : "";
    if (inlineTagLabel) {
      const span = doc.createElement("span");
      span.setAttribute("data-inline-tag", "true");
      span.setAttribute("data-inline-tag-label", inlineTagLabel);
      span.setAttribute("contenteditable", "false");
      span.textContent = inlineTagLabel;
      appendNode(target, span);
      return;
    }

    const noTranslateLabel = node.dataset.noTranslate
      ? normalizeInlineTagLabel(node.textContent || "")
      : "";
    if (noTranslateLabel) {
      const span = doc.createElement("span");
      span.setAttribute("data-no-translate", "true");
      appendChildren(node, span, doc);
      appendNode(target, span);
      return;
    }

    const iconName = node.dataset.inlineIcon as InlineIconName | undefined;
    if (iconName && iconName in INLINE_ICON_COMPONENTS) {
      const span = doc.createElement("span");
      span.setAttribute("data-inline-icon", iconName);
      span.setAttribute("contenteditable", "false");
      span.textContent = INLINE_ICON_TEXT[iconName];
      appendNode(target, span);
      return;
    }

    const inlineColor = sanitizeInlineColor(node.style.color);
    const inlineFontSize = sanitizeInlineFontSize(node.style.fontSize);
    const inlineLineHeight = sanitizeInlineLineHeight(node.style.lineHeight);
    if (inlineColor || inlineFontSize || inlineLineHeight) {
      const span = doc.createElement("span");
      if (inlineColor) span.style.color = inlineColor;
      if (inlineFontSize) span.style.fontSize = inlineFontSize;
      if (inlineLineHeight) span.style.lineHeight = inlineLineHeight;
      appendChildren(node, span, doc);
      appendNode(target, span);
      return;
    }
  }

  appendChildren(node, target, doc);
}

function removeEdgeBreaks(value: string) {
  return value
    .replace(/^(?:<br\b[^>]*>\s*)+/i, "")
    .replace(/(?:<br\b[^>]*>\s*)+$/i, "");
}

function getHeadingRenderStyle(tagName: "h1" | "h2" | "h3", lineHeight?: string | null) {
  if (tagName === "h1") {
    return { fontSize: "1.85em", fontWeight: 600, lineHeight: lineHeight || "1.1" };
  }

  if (tagName === "h2") {
    return { fontSize: "1.5em", fontWeight: 600, lineHeight: lineHeight || "1.15" };
  }

  return { fontSize: "1.2em", fontWeight: 600, lineHeight: lineHeight || "1.2" };
}

function getListItemMarker(node: HTMLElement) {
  const parent = node.parentElement;
  if (!parent || parent.tagName.toLowerCase() !== "ol") return "•";

  const listItems = Array.from(parent.children).filter((child) => child.tagName.toLowerCase() === "li");
  const index = listItems.indexOf(node);
  return `${index + 1}.`;
}

export function normalizeRichTextHtml(value?: string | null) {
  if (!value) return "";
  if (typeof window === "undefined") return value.trim();

  const parser = new DOMParser();
  const parsed = parser.parseFromString(value, "text/html");
  const doc = document.implementation.createHTMLDocument("");
  const container = doc.createElement("div");

  appendChildren(parsed.body, container, doc);

  return removeEdgeBreaks(container.innerHTML.replaceAll("&nbsp;", " ").trim());
}

export function richTextToPlainText(value?: string | null) {
  const normalized = normalizeRichTextHtml(value);
  if (!normalized) return normalized;
  if (typeof window === "undefined") {
    return normalized
      .replace(/<br\b[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const parser = new DOMParser();
  const parsed = parser.parseFromString(normalized, "text/html");
  parsed.body.querySelectorAll<HTMLElement>("[data-inline-icon]").forEach((icon) => {
    const iconName = icon.dataset.inlineIcon as InlineIconName | undefined;
    icon.textContent = iconName ? ` ${INLINE_ICON_LABELS[iconName]} ` : "";
  });
  return parsed.body.textContent?.replace(/\s+/g, " ").trim() || "";
}

export function isRichTextEmpty(value?: string | null) {
  const normalized = normalizeRichTextHtml(value);
  if (!normalized) return true;
  if (/\bdata-inline-icon=/.test(normalized)) return false;
  return richTextToPlainText(normalized) === "";
}

function renderNode(node: Node, key: string, theme: Theme): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }

  if (!(node instanceof HTMLElement)) return null;

  const tagName = node.tagName.toLowerCase();
  const children = Array.from(node.childNodes).map((child, index) => renderNode(child, `${key}-${index}`, theme));

  if (tagName === "br") return <br key={key} data-rich-text-break="true" />;
  if (tagName === "strong" || tagName === "b") return <strong key={key}>{children}</strong>;
  if (tagName === "em" || tagName === "i") return <em key={key}>{children}</em>;
  if (tagName === "u") return <u key={key}>{children}</u>;
  if (tagName === "a") {
    const href = node.getAttribute("href") || "#";
    const target = node.getAttribute("target") || undefined;
    const rel = node.getAttribute("rel") || undefined;
    return (
      <a key={key} href={href} target={target} rel={rel} className="underline underline-offset-4">
        {children}
      </a>
    );
  }
  if (tagName === "p" || tagName === "div") {
    const blockLineHeight = sanitizeInlineLineHeight(node.style.lineHeight);
    return (
      <span key={key} style={{ display: "block", lineHeight: blockLineHeight || undefined }}>
        {children}
      </span>
    );
  }
  if (tagName === "h1" || tagName === "h2" || tagName === "h3") {
    const blockLineHeight = sanitizeInlineLineHeight(node.style.lineHeight);
    return (
      <span key={key} style={{ display: "block", ...getHeadingRenderStyle(tagName, blockLineHeight) }}>
        {children}
      </span>
    );
  }
  if (tagName === "ul" || tagName === "ol") {
    return (
      <span key={key} style={{ display: "block" }}>
        {children}
      </span>
    );
  }
  if (tagName === "li") {
    const blockLineHeight = sanitizeInlineLineHeight(node.style.lineHeight);
    return (
      <span
        key={key}
        style={{
          display: "block",
          position: "relative",
          paddingLeft: "1.35em",
          lineHeight: blockLineHeight || undefined,
        }}
      >
        <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 0 }}>
          {getListItemMarker(node)}
        </span>
        <span>{children}</span>
      </span>
    );
  }
  if (tagName === "span" && node.dataset.inlineTag) {
    const inlineTagLabel = normalizeInlineTagLabel(node.dataset.inlineTagLabel || node.textContent || "");
    if (!inlineTagLabel) return null;
    return (
      <span
        key={key}
        data-inline-tag="true"
        data-inline-tag-label={inlineTagLabel}
        className="mx-[0.15em] inline-flex items-center rounded-full border px-2 py-0.5 align-middle text-[0.72em] font-medium leading-none"
        style={{
          borderColor: "var(--border-primary, #2A2A2A)",
          backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.06))",
          color: "var(--text-primary, #fafafa)",
        }}
      >
        {inlineTagLabel}
      </span>
    );
  }
  if (tagName === "span" && node.dataset.noTranslate) {
    return <span key={key} data-no-translate="true">{children}</span>;
  }
  if (tagName === "span" && node.dataset.inlineIcon) {
    const iconName = node.dataset.inlineIcon as InlineIconName;
    const Icon = INLINE_ICON_COMPONENTS[iconName];
    if (!Icon) return null;
    return (
      <span
        key={key}
        data-inline-icon={iconName}
        className="mx-[0.08em] inline-flex translate-y-[0.08em] align-baseline text-current"
      >
        <Icon size={14} strokeWidth={2.1} />
      </span>
    );
  }
  if (tagName === "span") {
    const inlineColor = sanitizeInlineColor(node.style.color);
    const inlineFontSize = sanitizeInlineFontSize(node.style.fontSize);
    const inlineLineHeight = sanitizeInlineLineHeight(node.style.lineHeight);
    if (inlineColor || inlineFontSize || inlineLineHeight) {
      const resolvedColor = resolveThemeAwareInlineColor(inlineColor, theme);
      return (
        <span
          key={key}
          style={{
            color: resolvedColor,
            fontSize: inlineFontSize || undefined,
            lineHeight: inlineLineHeight || undefined,
          }}
        >
          {children}
        </span>
      );
    }
  }

  return <span key={key}>{children}</span>;
}

export function RichTextContent({
  value,
  placeholder,
}: {
  value?: string | null;
  placeholder?: string;
}) {
  const { theme } = useTheme();
  const normalized = normalizeRichTextHtml(value);

  if (!normalized) {
    return placeholder ? <span className="opacity-35">{placeholder}</span> : null;
  }

  if (typeof window === "undefined") {
    return normalized;
  }

  const parser = new DOMParser();
  const parsed = parser.parseFromString(normalized, "text/html");

  return <>{Array.from(parsed.body.childNodes).map((node, index) => renderNode(node, `rich-${index}`, theme))}</>;
}

function insertHtmlAtSelection(html: string) {
  if (document.queryCommandSupported?.("insertHTML")) {
    document.execCommand("insertHTML", false, html);
    return;
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();
  const fragment = range.createContextualFragment(html);
  range.insertNode(fragment);
  selection.collapseToEnd();
}

function insertPlainTextAtSelection(text: string) {
  const html = escapeHtml(text).replace(/\n/g, RICH_TEXT_BREAK_HTML);
  insertHtmlAtSelection(html);
}

function normalizeLinkInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (isSafeUrl(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}(?:[/?#].*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function getCurrentRange() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  return selection.getRangeAt(0).cloneRange();
}

function restoreRange(range: Range | null) {
  if (!range) return;
  const selection = window.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
}

function isPlainStyleSpan(element: HTMLElement) {
  if (element.tagName.toLowerCase() !== "span") return false;
  if (element.dataset.inlineTag || element.dataset.inlineIcon || element.dataset.noTranslate) return false;
  return !element.getAttribute("style");
}

function unwrapElement(element: HTMLElement) {
  const parent = element.parentNode;
  if (!parent) return;

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
}

function findInlineTagElement(node: Node | null, root?: HTMLElement | null) {
  if (!node) return null;
  const element =
    node instanceof HTMLElement
      ? (node.matches("[data-inline-tag='true']") ? node : node.closest("[data-inline-tag='true']"))
      : node.parentElement?.closest("[data-inline-tag='true']");
  if (!element || (root && !root.contains(element))) return null;
  return element as HTMLElement;
}

function findNoTranslateElement(node: Node | null, root?: HTMLElement | null) {
  if (!node) return null;
  const element =
    node instanceof HTMLElement
      ? (node.matches("[data-no-translate='true']") ? node : node.closest("[data-no-translate='true']"))
      : node.parentElement?.closest("[data-no-translate='true']");
  if (!element || (root && !root.contains(element))) return null;
  return element as HTMLElement;
}

function getSelectedInlineTag(selection: Selection | null, root?: HTMLElement | null) {
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);

  const directMatch = findInlineTagElement(range.startContainer, root) ?? findInlineTagElement(range.endContainer, root);
  if (directMatch) return directMatch;

  const startContainer = range.startContainer;
  const endContainer = range.endContainer;

  if (startContainer instanceof Element) {
    const startCandidate = startContainer.childNodes[range.startOffset] ?? startContainer.childNodes[range.startOffset - 1] ?? null;
    const startTag = findInlineTagElement(startCandidate, root);
    if (startTag) return startTag;
  }

  if (endContainer instanceof Element) {
    const endCandidate = endContainer.childNodes[range.endOffset - 1] ?? endContainer.childNodes[range.endOffset] ?? null;
    const endTag = findInlineTagElement(endCandidate, root);
    if (endTag) return endTag;
  }

  return null;
}

function getSelectedNoTranslate(selection: Selection | null, root?: HTMLElement | null) {
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);

  const directMatch = findNoTranslateElement(range.startContainer, root) ?? findNoTranslateElement(range.endContainer, root);
  if (directMatch) return directMatch;

  const startContainer = range.startContainer;
  const endContainer = range.endContainer;

  if (startContainer instanceof Element) {
    const startCandidate = startContainer.childNodes[range.startOffset] ?? startContainer.childNodes[range.startOffset - 1] ?? null;
    const startTag = findNoTranslateElement(startCandidate, root);
    if (startTag) return startTag;
  }

  if (endContainer instanceof Element) {
    const endCandidate = endContainer.childNodes[range.endOffset - 1] ?? endContainer.childNodes[range.endOffset] ?? null;
    const endTag = findNoTranslateElement(endCandidate, root);
    if (endTag) return endTag;
  }

  return null;
}

function clearInlineStyleFromTree(
  node: Node,
  style: { clearColor: boolean; clearFontSize: boolean; clearLineHeight: boolean },
) {
  if (!(node instanceof HTMLElement)) return;

  if (style.clearColor) {
    node.style.removeProperty("color");
  }
  if (style.clearFontSize) {
    node.style.removeProperty("font-size");
  }
  if (style.clearLineHeight) {
    node.style.removeProperty("line-height");
  }

  Array.from(node.childNodes).forEach((child) => clearInlineStyleFromTree(child, style));

  if (isPlainStyleSpan(node)) {
    unwrapElement(node);
  }
}

function clearInlineStyleSelection(
  range: Range,
  style: { clearColor: boolean; clearFontSize: boolean; clearLineHeight: boolean },
) {
  const fragment = range.extractContents();
  const nodes = Array.from(fragment.childNodes);
  if (!nodes.length) return false;

  nodes.forEach((node) => clearInlineStyleFromTree(node, style));
  range.insertNode(fragment);

  const selection = window.getSelection();
  if (selection) {
    const nextRange = document.createRange();
    const lastNode = nodes[nodes.length - 1];
    if (lastNode.parentNode) {
      nextRange.setStartAfter(lastNode);
      nextRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(nextRange);
    }
  }

  return true;
}

function findClosestLineHeightBlock(node: Node | null, root: HTMLElement) {
  if (!node) return null;

  const element = node instanceof HTMLElement ? node : node.parentElement;
  if (!element) return null;

  const block = element.closest(RICH_TEXT_LINE_HEIGHT_BLOCK_SELECTOR);
  if (!block || !root.contains(block)) return null;
  return block as HTMLElement;
}

function getSelectedLineHeightBlocks(range: Range, root: HTMLElement) {
  const blocks = new Set<HTMLElement>();
  const startBlock = findClosestLineHeightBlock(range.startContainer, root);
  const endBlock = findClosestLineHeightBlock(range.endContainer, root);

  if (startBlock) blocks.add(startBlock);
  if (endBlock) blocks.add(endBlock);

  root.querySelectorAll<HTMLElement>(RICH_TEXT_LINE_HEIGHT_BLOCK_SELECTOR).forEach((block) => {
    try {
      if (range.intersectsNode(block)) {
        blocks.add(block);
      }
    } catch {
      // Ignore detached nodes while the selection is changing.
    }
  });

  return Array.from(blocks);
}

function applyLineHeightToBlocks(range: Range, root: HTMLElement, lineHeight: string) {
  const blocks = getSelectedLineHeightBlocks(range, root);
  if (!blocks.length) return false;

  blocks.forEach((block) => {
    if (lineHeight === "inherit") {
      block.style.removeProperty("line-height");
      return;
    }

    block.style.lineHeight = lineHeight;
  });

  return true;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  editorClassName?: string;
  editorStyle?: CSSProperties;
  containerClassName?: string;
  placeholderClassName?: string;
  multiline?: boolean;
  onEnter?: () => void;
  onBackspaceEmpty?: () => void;
  compact?: boolean;
  allowLinks?: boolean;
}

function ToolbarButton({
  label,
  onMouseDown,
  children,
}: {
  label: string;
  onMouseDown: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onMouseDown={onMouseDown}
          className="rounded-md p-1 text-[#888] transition-colors hover:bg-[#1a1a1a] hover:text-[#fafafa]"
          aria-label={label}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        className="border border-[#2a2a2a] bg-[#111111] px-2.5 py-1.5 text-[#f5f5f5]"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "",
  editorClassName = "",
  editorStyle,
  containerClassName = "",
  placeholderClassName = "",
  multiline = true,
  onEnter,
  onBackspaceEmpty,
  compact = false,
  allowLinks = true,
}: RichTextEditorProps) {
  const id = useId();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showIcons, setShowIcons] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showFontSizes, setShowFontSizes] = useState(false);
  const [showLineHeights, setShowLineHeights] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [savedLinkRange, setSavedLinkRange] = useState<Range | null>(null);
  const [savedStyleRange, setSavedStyleRange] = useState<Range | null>(null);
  const [linkDraft, setLinkDraft] = useState("https://");
  const [linkError, setLinkError] = useState("");
  const normalizedValue = useMemo(() => normalizeRichTextHtml(value), [value]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== normalizedValue && !isFocused) {
      editorRef.current.innerHTML = normalizedValue;
    }
  }, [isFocused, normalizedValue]);

  const commitValue = ({ syncDom = false }: { syncDom?: boolean } = {}) => {
    if (!editorRef.current) return;
    const nextValue = normalizeRichTextHtml(editorRef.current.innerHTML);
    if (syncDom && editorRef.current.innerHTML !== nextValue) {
      editorRef.current.innerHTML = nextValue;
    }
    onChange(nextValue);
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const runCommand = (command: string, commandValue?: string, range?: Range | null) => {
    focusEditor();
    if (range) {
      restoreRange(range);
    }
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(command, false, commandValue);
    commitValue();
  };

  const applyBlockFormat = (tagName: "H1" | "H2" | "H3") => {
    focusEditor();
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand("formatBlock", false, tagName);
    commitValue({ syncDom: true });
  };

  const insertIcon = (iconName: InlineIconName) => {
    focusEditor();
    insertHtmlAtSelection(
      `<span data-inline-icon="${iconName}" contenteditable="false">${INLINE_ICON_TEXT[iconName]}</span>&nbsp;`,
    );
    setShowIcons(false);
    commitValue();
  };

  const handleLink = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === "") return;
    const range = getCurrentRange();
    if (!range) return;
    const currentUrl = selection.anchorNode?.parentElement?.closest("a")?.getAttribute("href") || "https://";
    setSavedLinkRange(range);
    setLinkDraft(currentUrl);
    setLinkError("");
    setShowIcons(false);
    setShowColors(false);
    setShowFontSizes(false);
    setShowLineHeights(false);
    setShowLinkDialog(true);
  };

  const applyInlineStyle = (style: { color?: string; fontSize?: string; lineHeight?: string }, range?: Range | null) => {
    focusEditor();
    if (range) {
      restoreRange(range);
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const activeRange = selection.getRangeAt(0);
    if (activeRange.collapsed) return;

    const color = sanitizeInlineColor(style.color);
    const fontSize = sanitizeInlineFontSize(style.fontSize);
    const lineHeight = sanitizeInlineLineHeight(style.lineHeight);
    const clearColor = color === "inherit";
    const clearFontSize = fontSize === "inherit";
    const clearLineHeight = lineHeight === "inherit";
    if (!color && !fontSize && !lineHeight) return;

    if (editorRef.current && lineHeight) {
      const appliedToBlocks = applyLineHeightToBlocks(
        activeRange,
        editorRef.current,
        clearLineHeight ? "inherit" : lineHeight,
      );

      if (appliedToBlocks && !color && !fontSize && !clearColor && !clearFontSize && !clearLineHeight) {
        commitValue({ syncDom: true });
        return;
      }
    }

    if (clearColor || clearFontSize || clearLineHeight) {
      const cleared = clearInlineStyleSelection(activeRange, {
        clearColor,
        clearFontSize,
        clearLineHeight,
      });
      if (cleared) {
        commitValue({ syncDom: true });
      }
      return;
    }

    const fragment = activeRange.extractContents();
    if (!fragment.childNodes.length) return;

    const span = document.createElement("span");
    if (color) span.style.color = color;
    if (fontSize) span.style.fontSize = fontSize;
    if (lineHeight) span.style.lineHeight = lineHeight;
    span.appendChild(fragment);
    activeRange.insertNode(span);

    const nextRange = document.createRange();
    nextRange.selectNodeContents(span);
    nextRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(nextRange);

    commitValue({ syncDom: true });
  };

  const handleCreateTag = () => {
    focusEditor();
    const selection = window.getSelection();
    const selectedText = normalizeInlineTagLabel(selection?.toString() || "");
    if (!selection || selectedText === "") return;
    insertHtmlAtSelection(
      `<span data-inline-tag="true" data-inline-tag-label="${escapeHtml(selectedText)}" contenteditable="false">${escapeHtml(selectedText)}</span>`,
    );
    commitValue({ syncDom: true });
  };

  const handleProtectFromTranslation = () => {
    focusEditor();
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === "") return;

    const activeRange = selection.getRangeAt(0);
    if (activeRange.collapsed) return;

    const fragment = activeRange.extractContents();
    if (!fragment.childNodes.length) return;

    const span = document.createElement("span");
    span.setAttribute("data-no-translate", "true");
    span.appendChild(fragment);
    activeRange.insertNode(span);

    const nextRange = document.createRange();
    nextRange.selectNodeContents(span);
    nextRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(nextRange);

    commitValue({ syncDom: true });
  };

  const handleRemoveTag = () => {
    focusEditor();
    const selection = window.getSelection();
    const inlineTag = getSelectedInlineTag(selection, editorRef.current);
    if (!selection || !inlineTag) return;

    const textNode = document.createTextNode(inlineTag.dataset.inlineTagLabel || inlineTag.textContent || "");
    inlineTag.replaceWith(textNode);

    const nextRange = document.createRange();
    nextRange.setStart(textNode, textNode.textContent?.length ?? 0);
    nextRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(nextRange);

    commitValue({ syncDom: true });
  };

  const handleRemoveNoTranslate = () => {
    focusEditor();
    const selection = window.getSelection();
    const protectedTerm = getSelectedNoTranslate(selection, editorRef.current);
    if (!selection || !protectedTerm) return;

    const parent = protectedTerm.parentNode;
    if (!parent) return;

    const referenceNode = protectedTerm.nextSibling;
    unwrapElement(protectedTerm);

    const nextRange = document.createRange();
    if (referenceNode) {
      nextRange.setStartBefore(referenceNode);
    } else if (parent.lastChild) {
      if (parent.lastChild.nodeType === Node.TEXT_NODE) {
        const textNode = parent.lastChild as Text;
        nextRange.setStart(textNode, textNode.textContent?.length ?? 0);
      } else {
        nextRange.setStartAfter(parent.lastChild);
      }
    } else {
      nextRange.setStart(parent, parent.childNodes.length);
    }

    nextRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(nextRange);

    commitValue({ syncDom: true });
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData("text/plain");
    insertPlainTextAtSelection(multiline ? pastedText : pastedText.replace(/\s*\n+\s*/g, " "));
    commitValue();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      if (onEnter && !multiline) {
        event.preventDefault();
        onEnter();
        return;
      }

      if (multiline) {
        const selection = window.getSelection();
        const currentNode =
          selection?.anchorNode instanceof HTMLElement ? selection.anchorNode : selection?.anchorNode?.parentElement;
        const isInsideListItem = Boolean(currentNode?.closest("li"));
        if (isInsideListItem) {
          return;
        }
        event.preventDefault();
        insertHtmlAtSelection(RICH_TEXT_BREAK_HTML);
        commitValue();
      }
    }

    if (event.key === "Backspace" && onBackspaceEmpty && isRichTextEmpty(editorRef.current?.innerHTML || "")) {
      event.preventDefault();
      onBackspaceEmpty();
    }
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      const root = editorRef.current;
      if (!root) return;
      const selectedTag = getSelectedInlineTag(window.getSelection(), root);
      const selectedNoTranslate = getSelectedNoTranslate(window.getSelection(), root);
      root.querySelectorAll<HTMLElement>("[data-inline-tag='true']").forEach((node) => {
        if (node === selectedTag) {
          node.setAttribute("data-inline-tag-selected", "true");
        } else {
          node.removeAttribute("data-inline-tag-selected");
        }
      });
      root.querySelectorAll<HTMLElement>("[data-no-translate='true']").forEach((node) => {
        if (node === selectedNoTranslate) {
          node.setAttribute("data-no-translate-selected", "true");
        } else {
          node.removeAttribute("data-no-translate-selected");
        }
      });
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const toolbarVisible = isFocused || !compact;

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {toolbarVisible && (
        <div
          className="flex flex-wrap items-center gap-1 rounded-[10px] border px-2 py-1.5"
          style={{ backgroundColor: "#0e0e0e", borderColor: "#1e1e1e" }}
        >
          {multiline && (
            <>
              <ToolbarButton
                label="Transformar em título H1"
                onMouseDown={(event) => {
                  event.preventDefault();
                  applyBlockFormat("H1");
                }}
              >
                <Heading1 size={14} />
              </ToolbarButton>
              <ToolbarButton
                label="Transformar em título H2"
                onMouseDown={(event) => {
                  event.preventDefault();
                  applyBlockFormat("H2");
                }}
              >
                <Heading2 size={14} />
              </ToolbarButton>
              <ToolbarButton
                label="Transformar em título H3"
                onMouseDown={(event) => {
                  event.preventDefault();
                  applyBlockFormat("H3");
                }}
              >
                <Heading3 size={14} />
              </ToolbarButton>
              <ToolbarButton
                label="Criar lista"
                onMouseDown={(event) => {
                  event.preventDefault();
                  runCommand("insertUnorderedList");
                }}
              >
                <List size={14} />
              </ToolbarButton>
              <ToolbarButton
                label="Criar lista numerada"
                onMouseDown={(event) => {
                  event.preventDefault();
                  runCommand("insertOrderedList");
                }}
              >
                <ListOrdered size={14} />
              </ToolbarButton>
            </>
          )}
          <ToolbarButton
            label="Adicionar negrito"
            onMouseDown={(event) => {
              event.preventDefault();
              runCommand("bold");
            }}
          >
            <Bold size={14} />
          </ToolbarButton>
          <ToolbarButton
            label="Adicionar itálico"
            onMouseDown={(event) => {
              event.preventDefault();
              runCommand("italic");
            }}
          >
            <Italic size={14} />
          </ToolbarButton>
          <ToolbarButton
            label="Adicionar sublinhado"
            onMouseDown={(event) => {
              event.preventDefault();
              runCommand("underline");
            }}
          >
            <Underline size={14} />
          </ToolbarButton>
          {allowLinks && (
            <>
              <ToolbarButton
                label="Adicionar link"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleLink();
                }}
              >
                <Link2 size={14} />
              </ToolbarButton>
              <ToolbarButton
                label="Remover link"
                onMouseDown={(event) => {
                  event.preventDefault();
                  runCommand("unlink");
                }}
              >
                <Unlink size={14} />
              </ToolbarButton>
            </>
          )}
          <ToolbarButton
            label="Transformar seleção em tag"
            onMouseDown={(event) => {
              event.preventDefault();
              handleCreateTag();
            }}
          >
            <Tags size={14} />
          </ToolbarButton>
          <ToolbarButton
            label="Remover tag selecionada"
            onMouseDown={(event) => {
              event.preventDefault();
              handleRemoveTag();
            }}
          >
            <span className="text-[10px] font-semibold leading-none">#×</span>
          </ToolbarButton>
          <ToolbarButton
            label="Proteger seleção contra tradução"
            onMouseDown={(event) => {
              event.preventDefault();
              handleProtectFromTranslation();
            }}
          >
            <Languages size={14} />
          </ToolbarButton>
          <ToolbarButton
            label="Remover proteção de tradução"
            onMouseDown={(event) => {
              event.preventDefault();
              handleRemoveNoTranslate();
            }}
          >
            <span className="text-[10px] font-semibold leading-none">EN×</span>
          </ToolbarButton>
          <div className="relative">
            <ToolbarButton
              label="Alterar cor do texto"
              onMouseDown={(event) => {
                event.preventDefault();
                const range = getCurrentRange();
                if (!range || range.toString().trim() === "") return;
                setSavedStyleRange(range);
                setShowLineHeights(false);
                setShowFontSizes(false);
                setShowIcons(false);
                setShowColors((current) => !current);
              }}
            >
              <Palette size={14} />
            </ToolbarButton>
            {showColors && (
              <div
                className="absolute left-0 top-[calc(100%+6px)] z-20 w-[220px] rounded-[12px] border p-2 shadow-xl"
                style={{ backgroundColor: "#111111", borderColor: "#1e1e1e" }}
              >
                <div className="grid grid-cols-5 gap-1.5">
                  {INLINE_TEXT_COLORS.map((colorOption) => (
                    <Tooltip key={colorOption.value}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            applyInlineStyle({ color: colorOption.value }, savedStyleRange);
                            setShowColors(false);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-md border transition-colors hover:border-[#565656]"
                          style={{ borderColor: "#2a2a2a", backgroundColor: "#171717" }}
                          aria-label={`Aplicar cor: ${colorOption.label}`}
                        >
                          <span
                            className="h-5 w-5 rounded-full border"
                            style={{
                              background: colorOption.swatch,
                              borderColor: colorOption.value === "inherit" ? "#6a6a6a" : "transparent",
                            }}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        sideOffset={8}
                        className="border border-[#2a2a2a] bg-[#111111] px-2.5 py-1.5 text-[#f5f5f5]"
                      >
                        {`Aplicar cor: ${colorOption.label}`}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <ToolbarButton
              label="Alterar tamanho do texto"
              onMouseDown={(event) => {
                event.preventDefault();
                const range = getCurrentRange();
                if (!range || range.toString().trim() === "") return;
                setSavedStyleRange(range);
                setShowColors(false);
                setShowLineHeights(false);
                setShowIcons(false);
                setShowFontSizes((current) => !current);
              }}
            >
              <span className="text-[10px] font-semibold leading-none">A+</span>
            </ToolbarButton>
            {showFontSizes && (
              <div
                className="absolute left-0 top-[calc(100%+6px)] z-20 w-[170px] rounded-[12px] border p-2 shadow-xl"
                style={{ backgroundColor: "#111111", borderColor: "#1e1e1e" }}
              >
                <div className="grid grid-cols-2 gap-1.5">
                  {INLINE_FONT_SIZE_OPTIONS.map((sizeOption) => (
                    <button
                      key={sizeOption.value}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        applyInlineStyle({ fontSize: sizeOption.value }, savedStyleRange);
                        setShowFontSizes(false);
                      }}
                      className="rounded-md border px-2.5 py-2 text-left text-[#e8e8e8] transition-colors hover:border-[#565656] hover:bg-[#181818]"
                      style={{ borderColor: "#2a2a2a", fontSize: "12px", lineHeight: "16px" }}
                    >
                      {sizeOption.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <ToolbarButton
              label="Alterar entrelinha"
              onMouseDown={(event) => {
                event.preventDefault();
                const range = getCurrentRange();
                if (!range || range.toString().trim() === "") return;
                setSavedStyleRange(range);
                setShowColors(false);
                setShowFontSizes(false);
                setShowIcons(false);
                setShowLineHeights((current) => !current);
              }}
            >
              <span className="text-[10px] font-semibold leading-none">LH</span>
            </ToolbarButton>
            {showLineHeights && (
              <div
                className="absolute left-0 top-[calc(100%+6px)] z-20 w-[170px] rounded-[12px] border p-2 shadow-xl"
                style={{ backgroundColor: "#111111", borderColor: "#1e1e1e" }}
              >
                <div className="grid grid-cols-2 gap-1.5">
                  {INLINE_LINE_HEIGHT_OPTIONS.map((lineHeightOption) => (
                    <button
                      key={lineHeightOption.value}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        applyInlineStyle({ lineHeight: lineHeightOption.value }, savedStyleRange);
                        setShowLineHeights(false);
                      }}
                      className="rounded-md border px-2.5 py-2 text-left text-[#e8e8e8] transition-colors hover:border-[#565656] hover:bg-[#181818]"
                      style={{ borderColor: "#2a2a2a", fontSize: "12px", lineHeight: "16px" }}
                    >
                      {lineHeightOption.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <ToolbarButton
              label="Adicionar ícone"
              onMouseDown={(event) => {
                event.preventDefault();
                setShowColors(false);
                setShowFontSizes(false);
                setShowLineHeights(false);
                setShowIcons((current) => !current);
              }}
            >
              <Sparkles size={14} />
            </ToolbarButton>
            {showIcons && (
              <div
                className="absolute left-0 top-[calc(100%+6px)] z-20 flex items-center gap-1 rounded-[10px] border px-2 py-1.5 shadow-xl"
                style={{ backgroundColor: "#111", borderColor: "#1e1e1e" }}
              >
                {(Object.keys(INLINE_ICON_COMPONENTS) as InlineIconName[]).map((iconName) => {
                  const Icon = INLINE_ICON_COMPONENTS[iconName];
                  return (
                    <Tooltip key={iconName}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            insertIcon(iconName);
                          }}
                          className="rounded-md p-1 text-[#888] transition-colors hover:bg-[#1a1a1a] hover:text-[#fafafa]"
                          aria-label={INLINE_ICON_LABELS[iconName]}
                        >
                          <Icon size={14} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        sideOffset={8}
                        className="border border-[#2a2a2a] bg-[#111111] px-2.5 py-1.5 text-[#f5f5f5]"
                      >
                        {`Inserir ícone: ${INLINE_ICON_LABELS[iconName]}`}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative">
        {!isFocused && isRichTextEmpty(normalizedValue) && placeholder && (
          <div
            className={`pointer-events-none absolute left-0 top-0 text-[#555] ${placeholderClassName}`}
            style={editorStyle}
          >
            {placeholder}
          </div>
        )}
        <div
          id={id}
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline={multiline}
          aria-label={placeholder || "Editor de texto"}
          spellCheck
          onMouseDown={(event) => {
            const protectedInline = (event.target as HTMLElement).closest("[data-inline-tag='true'], [data-no-translate='true']");
            if (!protectedInline || !editorRef.current?.contains(protectedInline)) return;
            event.preventDefault();
            focusEditor();
            const selection = window.getSelection();
            if (!selection) return;
            const range = document.createRange();
            range.selectNode(protectedInline);
            selection.removeAllRanges();
            selection.addRange(range);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            commitValue({ syncDom: true });
            setIsFocused(false);
            setShowIcons(false);
            setShowColors(false);
            setShowFontSizes(false);
            setShowLineHeights(false);
          }}
          onInput={() => commitValue()}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          className={`rich-text-editor outline-none ${editorClassName}`}
          style={editorStyle}
        />
      </div>

      <Dialog
        open={showLinkDialog}
        onOpenChange={(open) => {
          setShowLinkDialog(open);
          if (!open) {
            setLinkError("");
            setSavedLinkRange(null);
          }
        }}
      >
        <DialogContent
          className="border-[#2a2a2a] bg-[#111111] p-0 text-[#fafafa] shadow-2xl"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const normalizedUrl = normalizeLinkInput(linkDraft);
              if (!normalizedUrl || !isSafeUrl(normalizedUrl)) {
                setLinkError("Use uma URL valida, email, telefone, ancora ou caminho interno.");
                return;
              }
              runCommand("createLink", normalizedUrl, savedLinkRange);
              setShowLinkDialog(false);
              setSavedLinkRange(null);
              setLinkError("");
              setLinkDraft("https://");
            }}
          >
            <DialogHeader className="border-b border-[#1f1f1f] px-5 py-4 text-left">
              <DialogTitle className="text-[#fafafa]" style={{ fontSize: "18px", lineHeight: "26px", fontWeight: 500 }}>
                Adicionar link
              </DialogTitle>
              <DialogDescription className="text-[#8a8a8a]" style={{ fontSize: "13px", lineHeight: "19px" }}>
                Cole a URL que deve ser aplicada ao texto selecionado.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 px-5 py-4">
              <label className="block text-[#777]" style={{ fontSize: "11px", lineHeight: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                URL
              </label>
              <Input
                autoFocus
                value={linkDraft}
                onChange={(event) => {
                  setLinkDraft(event.target.value);
                  if (linkError) setLinkError("");
                }}
                placeholder="https://exemplo.com"
                className="border-[#2a2a2a] bg-[#161616] text-[#fafafa] placeholder:text-[#5f5f5f]"
              />
              {linkError && (
                <p className="text-[#ff8d8d]" style={{ fontSize: "12px", lineHeight: "18px" }}>
                  {linkError}
                </p>
              )}
            </div>
            <DialogFooter className="border-t border-[#1f1f1f] px-5 py-4">
              <Button
                type="button"
                variant="outline"
                className="border-[#2a2a2a] bg-transparent text-[#d0d0d0] hover:bg-[#1a1a1a] hover:text-[#fafafa]"
                onClick={() => {
                  setShowLinkDialog(false);
                  setSavedLinkRange(null);
                  setLinkError("");
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#fafafa] text-[#111111] hover:bg-[#e9e9e9]">
                Aplicar link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
