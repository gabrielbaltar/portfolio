import type { ContentBlock } from "@portfolio/core";

export const CODE_LANGUAGE_OPTIONS = [
  { value: "plaintext", label: "Plain text" },
  { value: "typescript", label: "TypeScript" },
  { value: "tsx", label: "TSX / React" },
  { value: "javascript", label: "JavaScript" },
  { value: "jsx", label: "JSX / React" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash / Shell" },
  { value: "sql", label: "SQL" },
  { value: "python", label: "Python" },
  { value: "markdown", label: "Markdown" },
] as const;

export function getCodeLanguageLabel(language?: string) {
  if (!language) return "Plain text";
  return CODE_LANGUAGE_OPTIONS.find((item) => item.value === language)?.label || language;
}

export const ADJUSTABLE_LINE_HEIGHT_BLOCK_TYPES = [
  "paragraph",
  "heading1",
  "heading2",
  "heading3",
  "unordered-list",
  "ordered-list",
  "quote",
  "cta",
] as const;

type AdjustableLineHeightBlockType = (typeof ADJUSTABLE_LINE_HEIGHT_BLOCK_TYPES)[number];

const DEFAULT_BLOCK_LINE_HEIGHTS: Record<AdjustableLineHeightBlockType, number> = {
  paragraph: 24,
  heading1: 30,
  heading2: 26,
  heading3: 24,
  "unordered-list": 22,
  "ordered-list": 22,
  quote: 24,
  cta: 24,
};

export function isAdjustableLineHeightBlock(
  block: ContentBlock,
): block is Extract<ContentBlock, { type: AdjustableLineHeightBlockType }> {
  return (ADJUSTABLE_LINE_HEIGHT_BLOCK_TYPES as readonly string[]).includes(block.type);
}

export function clampBlockLineHeight(value: number) {
  return Math.max(16, Math.min(40, Math.round(value)));
}

export function getBlockLineHeight(block: Extract<ContentBlock, { type: AdjustableLineHeightBlockType }>) {
  return clampBlockLineHeight(block.lineHeight ?? DEFAULT_BLOCK_LINE_HEIGHTS[block.type]);
}
