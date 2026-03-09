import { normalizeRichTextHtml } from "./rich-text";

type AddText = (text: string) => number;

type RichTextNodeVisit =
  | { kind: "text"; node: Text }
  | { kind: "inline-tag"; element: HTMLElement };

type RichTextTranslationSegment =
  | { kind: "text"; index: number; original: string; prefix: string; suffix: string }
  | { kind: "inline-tag"; index: number; original: string };

export interface RichTextTranslationEntry {
  html: string;
  segments: RichTextTranslationSegment[];
}

function walkTranslatableNodes(root: ParentNode, visit: (node: RichTextNodeVisit) => void) {
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text;
      if (textNode.nodeValue?.trim()) {
        visit({ kind: "text", node: textNode });
      }
      return;
    }

    if (!(node instanceof HTMLElement)) return;

    if (node.dataset.inlineTag === "true") {
      visit({ kind: "inline-tag", element: node });
      return;
    }

    if (node.dataset.inlineIcon) return;

    Array.from(node.childNodes).forEach(walk);
  };

  Array.from(root.childNodes).forEach(walk);
}

function splitWhitespace(value: string) {
  const prefix = value.match(/^\s*/)?.[0] ?? "";
  const suffix = value.match(/\s*$/)?.[0] ?? "";
  const original = value.trim();
  return { prefix, suffix, original };
}

export function collectRichTextTranslation(
  value: string,
  addText: AddText,
): RichTextTranslationEntry | null {
  const html = normalizeRichTextHtml(value);
  if (!html || typeof window === "undefined") return null;

  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, "text/html");
  const segments: RichTextTranslationSegment[] = [];

  walkTranslatableNodes(parsed.body, (entry) => {
    if (entry.kind === "text") {
      const { prefix, suffix, original } = splitWhitespace(entry.node.nodeValue ?? "");
      if (!original) return;
      segments.push({
        kind: "text",
        index: addText(original),
        original,
        prefix,
        suffix,
      });
      return;
    }

    const original = (
      entry.element.dataset.inlineTagLabel ||
      entry.element.textContent ||
      ""
    ).trim();

    if (!original) return;
    segments.push({
      kind: "inline-tag",
      index: addText(original),
      original,
    });
  });

  return { html, segments };
}

export function applyRichTextTranslation(
  entry: RichTextTranslationEntry,
  resolveText: (index: number, original: string) => string,
) {
  if (!entry.segments.length || typeof window === "undefined") {
    return entry.html;
  }

  const parser = new DOMParser();
  const parsed = parser.parseFromString(entry.html, "text/html");
  let cursor = 0;

  walkTranslatableNodes(parsed.body, (nodeEntry) => {
    const segment = entry.segments[cursor];
    cursor += 1;
    if (!segment) return;

    if (nodeEntry.kind === "text" && segment.kind === "text") {
      const translated = resolveText(segment.index, segment.original);
      nodeEntry.node.nodeValue = `${segment.prefix}${translated}${segment.suffix}`;
      return;
    }

    if (nodeEntry.kind === "inline-tag" && segment.kind === "inline-tag") {
      const translated = resolveText(segment.index, segment.original);
      nodeEntry.element.dataset.inlineTagLabel = translated;
      nodeEntry.element.textContent = translated;
    }
  });

  return normalizeRichTextHtml(parsed.body.innerHTML);
}
