import { BlockEditor } from "./block-editor";
import { toast } from "sonner";
import { VersionHistoryPanel, saveVersion, getVersions } from "./version-history";
import { ImagePositionEditor, ImagePositionEditorCompact } from "./image-position-editor";
import { VideoPlayer } from "./video-player";
import { useState, useEffect, useCallback, useRef } from "react";
import type { ContentListItem } from "@portfolio/core";
import { ensureUniqueSlug, getPublicContentVisibilityKey, isReservedPageSlug, slugify } from "@portfolio/core";
import { useParams, useNavigate, Link } from "react-router";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ArrowLeft, Save, Eye, Send,
  PanelLeft, Columns, Monitor, Smartphone,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Hash, Globe,
  Plus, Upload, X, History, Lock, LockOpen, Video, Code, GripVertical, RotateCcw,
} from "lucide-react";
import { useCMS, type ContentBlock, type ContentStatus, type Project, type BlogPost, type Page, type SiteSettings, type TextAppearance } from "./cms-data";
import { dataProvider } from "./data-provider";
import {
  clampBlockLineHeight,
  CODE_LANGUAGE_OPTIONS,
  getBlockLineHeight,
  getCodeLanguageLabel,
  isAdjustableLineHeightBlock,
} from "./content-block-utils";
import { LineHeightControl } from "./line-height-control";
import { CodeHighlight } from "./code-highlight";
import { ContentEmbed } from "./content-embed";
import { isRichTextEmpty, RichTextContent, RichTextEditor, richTextToPlainText } from "./rich-text";
import { ShowcaseBlockView, isShowcaseBlock } from "./showcase-blocks";
import {
  SelectionProtectedInput,
  SelectionProtectedTextarea,
} from "./text-protection";
import { PreviewMediaSlider } from "./content-preview-cards";
import { ContentImage, inferVisualAssetKind, isSupportedVisualUpload, supportsPositionEditor } from "./content-image";
import { CMS_SAVE_SHORTCUT_EVENT } from "./cms-shortcuts";
import {
  ARTICLE_SUBTITLE_APPEARANCE_DEFAULTS,
  ARTICLE_TITLE_APPEARANCE_DEFAULTS,
  DETAIL_PAGE_TITLE_RESPONSIVE_LIMITS,
  PROJECT_SUBTITLE_APPEARANCE_DEFAULTS,
  PROJECT_TITLE_APPEARANCE_DEFAULTS,
  getResponsiveTextAppearanceValues,
  resolveTextAppearanceStyle,
  type ResponsiveTextAppearanceLimits,
} from "./text-appearance";
import {
  appendChildListItem,
  insertSiblingListItem,
  outdentListItem,
  removeListItem,
  updateListItemText,
} from "./list-block-utils";
import { getAvailableContentStatuses, getContentStatusMeta } from "./content-status";

// Editor types
type EditorMode = "form" | "visual" | "split";
type ContentType = "projects" | "articles" | "pages";
type EditorSection = {
  key: string;
  title: string;
  defaultOpen?: boolean;
  content: React.ReactNode;
};

const FORM_SECTION_DND_TYPE = "EDITOR_FORM_SECTION";
const SECTION_ORDER_STORAGE_PREFIX = "cms-editor-section-order:";
const DEFAULT_SECTION_ORDER: Record<ContentType, string[]> = {
  projects: ["basics", "images", "content", "organization", "protection", "seo"],
  articles: ["basics", "images", "content", "organization", "protection", "seo"],
  pages: ["basics", "content", "seo"],
};

type SectionDragItem = {
  index: number;
  type: string;
};

function normalizeSectionOrder(stored: string[], available: string[]) {
  return [
    ...stored.filter((key) => available.includes(key)),
    ...available.filter((key) => !stored.includes(key)),
  ];
}

function readSectionOrder(contentType: ContentType) {
  const fallback = DEFAULT_SECTION_ORDER[contentType];
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(`${SECTION_ORDER_STORAGE_PREFIX}${contentType}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return normalizeSectionOrder(parsed.filter((item): item is string => typeof item === "string"), fallback);
  } catch {
    return fallback;
  }
}

function writeSectionOrder(contentType: ContentType, order: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${SECTION_ORDER_STORAGE_PREFIX}${contentType}`, JSON.stringify(order));
}

function getDividerSpacing(block: Extract<ContentBlock, { type: "divider" }>) {
  return Math.max(24, Math.min(160, block.spacing ?? 72));
}

const CMS_UNORDERED_LIST_STYLE_TYPES = ["disc", "circle", "square"] as const;
const CMS_ORDERED_LIST_STYLE_TYPES = ["decimal", "lower-alpha", "lower-roman"] as const;
const CMS_AUTOSAVE_DELAY_MS = 800;

function getCmsListStyleType(ordered: boolean, depth: number) {
  const styles = ordered ? CMS_ORDERED_LIST_STYLE_TYPES : CMS_UNORDERED_LIST_STYLE_TYPES;
  return styles[depth % styles.length];
}

function getImageFiles(files: FileList | File[]) {
  return Array.from(files).filter((file) => file.type.startsWith("image/"));
}

type ProjectEditorFields = {
  cardTitle?: string;
  cardSubtitle?: string;
  cardImage?: string;
  cardImagePosition?: string;
};

type BlogPostEditorFields = {
  cardTitle?: string;
  cardSubtitle?: string;
  cardImage?: string;
  cardImagePosition?: string;
};

function normalizeProjectCardField(value: unknown) {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  return normalized && !isRichTextEmpty(normalized) ? normalized : "";
}

function normalizeTextAppearanceOverride(value: TextAppearance | undefined) {
  const normalized: TextAppearance = {};

  if (typeof value?.fontSize === "number") normalized.fontSize = value.fontSize;
  if (typeof value?.lineHeight === "number") normalized.lineHeight = value.lineHeight;
  if (typeof value?.fontWeight === "number") normalized.fontWeight = value.fontWeight;

  const normalizedColor = sanitizeAppearanceColor(value?.color || "");
  if (normalizedColor) normalized.color = normalizedColor;

  if (typeof value?.tablet?.fontSize === "number" || typeof value?.tablet?.lineHeight === "number") {
    normalized.tablet = {};
    if (typeof value.tablet?.fontSize === "number") normalized.tablet.fontSize = value.tablet.fontSize;
    if (typeof value.tablet?.lineHeight === "number") normalized.tablet.lineHeight = value.tablet.lineHeight;
  }

  if (typeof value?.mobile?.fontSize === "number" || typeof value?.mobile?.lineHeight === "number") {
    normalized.mobile = {};
    if (typeof value.mobile?.fontSize === "number") normalized.mobile.fontSize = value.mobile.fontSize;
    if (typeof value.mobile?.lineHeight === "number") normalized.mobile.lineHeight = value.mobile.lineHeight;
  }

  return Object.keys(normalized).length ? normalized : undefined;
}

function attachProjectCardFields(project: Project, siteSettings: SiteSettings) {
  const override = siteSettings.projectCardOverrides?.[project.id];

  return {
    ...project,
    cardTitle: override?.title || "",
    cardSubtitle: override?.subtitle || "",
    cardImage: override?.image || project.cardImage || "",
    cardImagePosition: override?.imagePosition || project.cardImagePosition || project.imagePosition || "50% 50%",
    titleAppearance: override?.titleAppearance || project.titleAppearance,
    subtitleAppearance: override?.subtitleAppearance || project.subtitleAppearance,
  };
}

function splitProjectCardFields(project: Project & ProjectEditorFields) {
  const { cardTitle, cardSubtitle, cardImage, cardImagePosition, titleAppearance, subtitleAppearance, ...persistedProject } = project;
  const normalizedCardTitle = normalizeProjectCardField(cardTitle);
  const normalizedCardSubtitle = normalizeProjectCardField(cardSubtitle);
  const normalizedCardImage = typeof cardImage === "string" ? cardImage.trim() : "";
  const normalizedCardImagePosition = typeof cardImagePosition === "string" ? cardImagePosition.trim() : "";
  const normalizedTitleAppearance = normalizeTextAppearanceOverride(titleAppearance);
  const normalizedSubtitleAppearance = normalizeTextAppearanceOverride(subtitleAppearance);

  return {
    project: persistedProject as Project,
    override:
      normalizedCardTitle || normalizedCardSubtitle || normalizedCardImage || normalizedTitleAppearance || normalizedSubtitleAppearance
        ? {
            ...(normalizedCardTitle ? { title: normalizedCardTitle } : {}),
            ...(normalizedCardSubtitle ? { subtitle: normalizedCardSubtitle } : {}),
            ...(normalizedCardImage ? { image: normalizedCardImage } : {}),
            ...(normalizedCardImage && normalizedCardImagePosition ? { imagePosition: normalizedCardImagePosition } : {}),
            ...(normalizedTitleAppearance ? { titleAppearance: normalizedTitleAppearance } : {}),
            ...(normalizedSubtitleAppearance ? { subtitleAppearance: normalizedSubtitleAppearance } : {}),
          }
        : null,
  };
}

function attachBlogPostCardFields(post: BlogPost, siteSettings: SiteSettings) {
  const override = siteSettings.blogPostCardOverrides?.[post.id];

  return {
    ...post,
    cardTitle: override?.title || post.cardTitle || "",
    cardSubtitle: override?.subtitle || post.cardSubtitle || "",
    cardImage: override?.image || post.cardImage || "",
    cardImagePosition: override?.imagePosition || post.cardImagePosition || post.imagePosition || "50% 50%",
    titleAppearance: override?.titleAppearance || post.titleAppearance,
    subtitleAppearance: override?.subtitleAppearance || post.subtitleAppearance,
  };
}

function splitBlogPostCardFields(post: BlogPost & BlogPostEditorFields) {
  const { cardTitle, cardSubtitle, cardImage, cardImagePosition, titleAppearance, subtitleAppearance, ...persistedPost } = post;
  const normalizedCardTitle = normalizeProjectCardField(cardTitle);
  const normalizedCardSubtitle = normalizeProjectCardField(cardSubtitle);
  const normalizedCardImage = typeof cardImage === "string" ? cardImage.trim() : "";
  const normalizedCardImagePosition = typeof cardImagePosition === "string" ? cardImagePosition.trim() : "";
  const normalizedTitleAppearance = normalizeTextAppearanceOverride(titleAppearance);
  const normalizedSubtitleAppearance = normalizeTextAppearanceOverride(subtitleAppearance);

  return {
    post: persistedPost as BlogPost,
    override:
      normalizedCardTitle || normalizedCardSubtitle || normalizedCardImage || normalizedTitleAppearance || normalizedSubtitleAppearance
        ? {
            ...(normalizedCardTitle ? { title: normalizedCardTitle } : {}),
            ...(normalizedCardSubtitle ? { subtitle: normalizedCardSubtitle } : {}),
            ...(normalizedCardImage ? { image: normalizedCardImage } : {}),
            ...(normalizedCardImage && normalizedCardImagePosition ? { imagePosition: normalizedCardImagePosition } : {}),
            ...(normalizedTitleAppearance ? { titleAppearance: normalizedTitleAppearance } : {}),
            ...(normalizedSubtitleAppearance ? { subtitleAppearance: normalizedSubtitleAppearance } : {}),
          }
        : null,
  };
}

// Reusable form components
function Input({ label, value, onChange, placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[#777]" style={{ fontSize: "11px", lineHeight: "16.5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      <SelectionProtectedInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[37.5px] w-full rounded-[10px] px-3 text-[#fafafa] placeholder:text-[#ababab] focus:outline-none transition-colors"
        style={{ fontSize: "13px", lineHeight: "19.5px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3, placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[#777]" style={{ fontSize: "11px", lineHeight: "16.5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      <SelectionProtectedTextarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-none rounded-[10px] px-3 py-2 text-[#fafafa] placeholder:text-[#ababab] focus:outline-none transition-colors"
        style={{ minHeight: rows === 3 ? "76.5px" : undefined, fontSize: "13px", lineHeight: "19.5px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
      />
    </div>
  );
}

function RichTextField({
  label,
  value,
  onChange,
  placeholder = "",
  multiline = false,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  helperText?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="block text-[#777]"
        style={{ fontSize: "11px", lineHeight: "16.5px", textTransform: "uppercase", letterSpacing: "0.5px" }}
      >
        {label}
      </label>
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        multiline={multiline}
        compact
        containerClassName="space-y-1.5"
        editorClassName="w-full rounded-[10px] px-3 py-2 text-[#fafafa] placeholder:text-[#ababab] focus:outline-none transition-colors"
        editorStyle={{
          fontSize: "13px",
          lineHeight: multiline ? "20px" : "19.5px",
          minHeight: multiline ? "96px" : "37.5px",
          backgroundColor: "#141414",
          border: "1px solid #1e1e1e",
        }}
      />
      {helperText ? (
        <p className="text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

function sanitizeAppearanceColor(value: string) {
  const normalized = value.trim();
  if (!normalized) return undefined;
  if (/^#[\da-f]{6}$/i.test(normalized) || /^#[\da-f]{3}$/i.test(normalized)) return normalized;
  return undefined;
}

const LINE_HEIGHT_PERCENT_LIMITS = {
  min: 50,
  max: 200,
  step: 1,
} as const;

function clampLineHeightPercent(value: number) {
  return Math.max(LINE_HEIGHT_PERCENT_LIMITS.min, Math.min(LINE_HEIGHT_PERCENT_LIMITS.max, Math.round(value)));
}

function lineHeightToPercent(lineHeight: number, fontSize: number) {
  if (!Number.isFinite(lineHeight) || !Number.isFinite(fontSize) || fontSize <= 0) {
    return 100;
  }

  return clampLineHeightPercent((lineHeight / fontSize) * 100);
}

function percentToLineHeight(percent: number, fontSize: number) {
  const safeFontSize = Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 1;
  return Number(((clampLineHeightPercent(percent) * safeFontSize) / 100).toFixed(1));
}

function buildAppearanceValue(
  nextValue: TextAppearance,
  defaults: { fontSize: number; lineHeight: number; fontWeight: number; color: string },
  responsiveLimits?: ResponsiveTextAppearanceLimits,
) {
  const normalized: TextAppearance = {};

  if (typeof nextValue.fontSize === "number" && nextValue.fontSize !== defaults.fontSize) normalized.fontSize = nextValue.fontSize;
  if (typeof nextValue.lineHeight === "number" && nextValue.lineHeight !== defaults.lineHeight) normalized.lineHeight = nextValue.lineHeight;
  if (typeof nextValue.fontWeight === "number" && nextValue.fontWeight !== defaults.fontWeight) normalized.fontWeight = nextValue.fontWeight;

  const normalizedColor = sanitizeAppearanceColor(nextValue.color || "");
  if (normalizedColor) normalized.color = normalizedColor;

  if (responsiveLimits) {
    const responsiveValues = getResponsiveTextAppearanceValues(nextValue, defaults, responsiveLimits);

    if (
      typeof nextValue.tablet?.fontSize === "number" && nextValue.tablet.fontSize !== responsiveValues.tabletDefault.fontSize ||
      typeof nextValue.tablet?.lineHeight === "number" && nextValue.tablet.lineHeight !== responsiveValues.tabletDefault.lineHeight
    ) {
      normalized.tablet = {};
      if (typeof nextValue.tablet?.fontSize === "number" && nextValue.tablet.fontSize !== responsiveValues.tabletDefault.fontSize) {
        normalized.tablet.fontSize = nextValue.tablet.fontSize;
      }
      if (typeof nextValue.tablet?.lineHeight === "number" && nextValue.tablet.lineHeight !== responsiveValues.tabletDefault.lineHeight) {
        normalized.tablet.lineHeight = nextValue.tablet.lineHeight;
      }
    }

    if (
      typeof nextValue.mobile?.fontSize === "number" && nextValue.mobile.fontSize !== responsiveValues.mobileDefault.fontSize ||
      typeof nextValue.mobile?.lineHeight === "number" && nextValue.mobile.lineHeight !== responsiveValues.mobileDefault.lineHeight
    ) {
      normalized.mobile = {};
      if (typeof nextValue.mobile?.fontSize === "number" && nextValue.mobile.fontSize !== responsiveValues.mobileDefault.fontSize) {
        normalized.mobile.fontSize = nextValue.mobile.fontSize;
      }
      if (typeof nextValue.mobile?.lineHeight === "number" && nextValue.mobile.lineHeight !== responsiveValues.mobileDefault.lineHeight) {
        normalized.mobile.lineHeight = nextValue.mobile.lineHeight;
      }
    }
  }

  return Object.keys(normalized).length ? normalized : undefined;
}

function TextAppearanceControl({
  label,
  value,
  onChange,
  defaults,
  defaultColorValue,
  sample,
  fontSizeRange,
  responsiveLimits,
}: {
  label: string;
  value?: TextAppearance;
  onChange: (value?: TextAppearance) => void;
  defaults: { fontSize: number; lineHeight: number; fontWeight: number; color: string };
  defaultColorValue: string;
  sample: string;
  fontSizeRange: { min: number; max: number; step?: number };
  responsiveLimits?: ResponsiveTextAppearanceLimits;
}) {
  const currentFontSize = value?.fontSize ?? defaults.fontSize;
  const currentLineHeight = value?.lineHeight ?? defaults.lineHeight;
  const currentLineHeightPercent = lineHeightToPercent(currentLineHeight, currentFontSize);
  const currentFontWeight = value?.fontWeight ?? defaults.fontWeight;
  const currentColor = value?.color || defaults.color;
  const responsiveValues = responsiveLimits ? getResponsiveTextAppearanceValues(value, defaults, responsiveLimits) : undefined;

  const updateAppearance = (patch: Partial<TextAppearance>) => {
    onChange(buildAppearanceValue({ ...value, ...patch }, defaults, responsiveLimits));
  };

  const updateResponsiveAppearance = (breakpoint: "tablet" | "mobile", patch: { fontSize?: number; lineHeight?: number }) => {
    onChange(
      buildAppearanceValue(
        {
          ...value,
          [breakpoint]: {
            ...(value?.[breakpoint] ?? {}),
            ...patch,
          },
        },
        defaults,
        responsiveLimits,
      ),
    );
  };

  const resetResponsiveAppearance = (breakpoint: "tablet" | "mobile") => {
    onChange(buildAppearanceValue({ ...value, [breakpoint]: undefined }, defaults, responsiveLimits));
  };

  const weightOptions = [400, 500, 600, 700];
  const responsiveSections = responsiveValues
    ? [
        {
          key: "tablet" as const,
          label: "Tablet",
          description: "500px a 768px",
          fontSize: responsiveValues.tablet.fontSize,
          lineHeight: responsiveValues.tablet.lineHeight,
          lineHeightPercent: lineHeightToPercent(responsiveValues.tablet.lineHeight, responsiveValues.tablet.fontSize),
        },
        {
          key: "mobile" as const,
          label: "Mobile",
          description: "Abaixo de 500px",
          fontSize: responsiveValues.mobile.fontSize,
          lineHeight: responsiveValues.mobile.lineHeight,
          lineHeightPercent: lineHeightToPercent(responsiveValues.mobile.lineHeight, responsiveValues.mobile.fontSize),
        },
      ]
    : [];

  return (
    <div className="space-y-4 rounded-[14px] border p-4" style={{ borderColor: "#1e1e1e", backgroundColor: "#101010" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[#ddd]" style={{ fontSize: "12px", lineHeight: "18px" }}>{label}</p>
          <p className="mt-1 text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
            {responsiveLimits
              ? "Ajuste a base do texto e, se precisar, defina tamanhos especificos para tablet e mobile. A entrelinhas usa percentual, como no Figma."
              : "Ajuste tamanho, peso, entrelinhas em percentual e cor do texto desta seção."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="rounded-[10px] border px-3 py-1.5 text-[#888] transition-colors hover:text-[#fafafa]"
          style={{ borderColor: "#1e1e1e", fontSize: "12px", lineHeight: "18px" }}
        >
          Resetar
        </button>
      </div>

      <div className="rounded-[12px] border px-4 py-3" style={{ borderColor: "#1e1e1e", backgroundColor: "#141414" }}>
        <span
          style={resolveTextAppearanceStyle(
            { fontSize: currentFontSize, lineHeight: currentLineHeight, fontWeight: currentFontWeight, color: currentColor },
            defaults,
          )}
        >
          {sample}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 min-[1180px]:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#777]" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tamanho</span>
            <span className="text-[#aaa]" style={{ fontSize: "11px" }}>{currentFontSize}px</span>
          </div>
          <input
            type="range"
            min={fontSizeRange.min}
            max={fontSizeRange.max}
            step={fontSizeRange.step || 1}
            value={currentFontSize}
            onChange={(event) => updateAppearance({ fontSize: Number(event.target.value) })}
            className="w-full accent-[#fafafa]"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#777]" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Entrelinhas</span>
            <span className="text-[#aaa]" style={{ fontSize: "11px" }}>{currentLineHeightPercent}%</span>
          </div>
          <input
            type="range"
            min={LINE_HEIGHT_PERCENT_LIMITS.min}
            max={LINE_HEIGHT_PERCENT_LIMITS.max}
            step={LINE_HEIGHT_PERCENT_LIMITS.step}
            value={currentLineHeightPercent}
            onChange={(event) =>
              updateAppearance({ lineHeight: percentToLineHeight(Number(event.target.value), currentFontSize) })}
            className="w-full accent-[#fafafa]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 min-[1180px]:grid-cols-[1fr,180px]">
        <div className="space-y-2">
          <span className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Peso</span>
          <div className="flex flex-wrap gap-2">
            {weightOptions.map((weight) => (
              <button
                key={weight}
                type="button"
                onClick={() => updateAppearance({ fontWeight: weight })}
                className="rounded-[10px] border px-3 py-1.5 transition-colors"
                style={{
                  borderColor: currentFontWeight === weight ? "#fafafa" : "#1e1e1e",
                  color: currentFontWeight === weight ? "#fafafa" : "#888",
                  backgroundColor: currentFontWeight === weight ? "#1a1a1a" : "transparent",
                  fontSize: "12px",
                  lineHeight: "18px",
                }}
              >
                {weight}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Cor</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={sanitizeAppearanceColor(currentColor) || defaultColorValue}
              onChange={(event) => updateAppearance({ color: event.target.value })}
              className="h-9 w-10 rounded cursor-pointer border-none p-0"
              style={{ backgroundColor: "transparent" }}
            />
            <SelectionProtectedInput
              type="text"
              value={sanitizeAppearanceColor(currentColor) || ""}
              onChange={(event) => updateAppearance({ color: event.target.value })}
              placeholder={defaultColorValue}
              className="flex-1 rounded-[10px] px-3 py-2 text-[#fafafa] placeholder:text-[#555] focus:outline-none"
              style={{ fontSize: "12px", lineHeight: "18px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
            />
          </div>
        </div>
      </div>

      {responsiveSections.length > 0 && (
        <div className="space-y-3 rounded-[12px] border p-4" style={{ borderColor: "#1e1e1e", backgroundColor: "#141414" }}>
          <div>
            <p className="text-[#ddd]" style={{ fontSize: "11px", lineHeight: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Ajustes responsivos
            </p>
            <p className="mt-1 text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
              Esses valores entram apenas nos breakpoints menores da página interna.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 min-[1180px]:grid-cols-2">
            {responsiveSections.map((section) => (
              <div
                key={section.key}
                className="space-y-3 rounded-[12px] border p-4"
                style={{ borderColor: "#1e1e1e", backgroundColor: "#101010" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[#ddd]" style={{ fontSize: "12px", lineHeight: "18px" }}>{section.label}</p>
                    <p className="mt-1 text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>{section.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => resetResponsiveAppearance(section.key)}
                    className="rounded-[10px] border px-3 py-1.5 text-[#888] transition-colors hover:text-[#fafafa]"
                    style={{ borderColor: "#1e1e1e", fontSize: "11px", lineHeight: "16px" }}
                  >
                    Resetar
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#777]" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tamanho</span>
                    <span className="text-[#aaa]" style={{ fontSize: "11px" }}>{section.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={fontSizeRange.min}
                    max={fontSizeRange.max}
                    step={fontSizeRange.step || 1}
                    value={section.fontSize}
                    onChange={(event) => updateResponsiveAppearance(section.key, { fontSize: Number(event.target.value) })}
                    className="w-full accent-[#fafafa]"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#777]" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Entrelinhas</span>
                    <span className="text-[#aaa]" style={{ fontSize: "11px" }}>{section.lineHeightPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={LINE_HEIGHT_PERCENT_LIMITS.min}
                    max={LINE_HEIGHT_PERCENT_LIMITS.max}
                    step={LINE_HEIGHT_PERCENT_LIMITS.step}
                    value={section.lineHeightPercent}
                    onChange={(event) =>
                      updateResponsiveAppearance(section.key, {
                        lineHeight: percentToLineHeight(Number(event.target.value), section.fontSize),
                      })}
                    className="w-full accent-[#fafafa]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TagsInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");
  const [editingTag, setEditingTag] = useState<string | null>(null);

  const resetEditor = () => {
    setInput("");
    setEditingTag(null);
  };

  const upsert = () => {
    const tag = input.trim().toLowerCase();
    if (!tag) return;

    const isDuplicate = tags.some((current) => current === tag && current !== editingTag);
    if (isDuplicate) {
      toast.error("Essa tag ja existe.");
      return;
    }

    if (editingTag) {
      onChange(tags.map((current) => (current === editingTag ? tag : current)));
    } else {
      onChange([...tags, tag]);
    }

    resetEditor();
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((current) => current !== tag));
    if (editingTag === tag) resetEditor();
  };

  const startEdit = (tag: string) => {
    setInput(tag);
    setEditingTag(tag);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tags</label>
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1"
              style={{ fontSize: "11px", backgroundColor: "#1e1e1e", color: "#aaa" }}
            >
              <span className="inline-flex items-center gap-1">
                <Hash size={10} />
                {tag}
              </span>
              <button
                type="button"
                onClick={() => startEdit(tag)}
                className="rounded px-1 py-0.5 text-[#888] transition-colors hover:text-[#fafafa]"
                title={`Editar tag ${tag}`}
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="inline-flex items-center rounded px-1 py-0.5 text-[#888] transition-colors hover:text-[#ff7b7b]"
                title={`Excluir tag ${tag}`}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#555] mb-2" style={{ fontSize: "11px" }}>
          Nenhuma tag criada ainda.
        </p>
      )}
      <div className="flex gap-2">
        <SelectionProtectedInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); upsert(); } }}
          placeholder="Adicionar tag..."
          className="flex-1 rounded-lg px-3 py-1.5 text-[#fafafa] placeholder-[#444] focus:outline-none"
          style={{ fontSize: "12px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
        />
        <button
          type="button"
          onClick={upsert}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[#fafafa] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          style={{ fontSize: "12px", backgroundColor: "#1e1e1e", border: "1px solid #2a2a2a" }}
          disabled={!input.trim()}
        >
          <Plus size={12} />
          {editingTag ? "Salvar tag" : "Criar tag"}
        </button>
        {editingTag && (
          <button
            type="button"
            onClick={resetEditor}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[#999] transition-colors hover:text-[#fafafa]"
            style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}
          >
            Cancelar
          </button>
        )}
      </div>
      <p className="text-[#555]" style={{ fontSize: "11px" }}>
        Use o botao para criar. Para editar uma tag existente, clique em <span className="text-[#888]">Editar</span>.
      </p>
    </div>
  );
}

function StatusSelector({
  status,
  onChange,
  contentType,
}: {
  status: ContentStatus;
  onChange: (s: ContentStatus) => void;
  contentType: "projects" | "articles" | "pages";
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const availableStatuses = getAvailableContentStatuses(contentType);
  const current = getContentStatusMeta(status);

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="flex h-8 items-center gap-2 rounded-[10px] px-[13px] cursor-pointer transition-colors hover:bg-[#1a1a1a]"
        style={{ fontSize: "12px", lineHeight: "18px", border: "1px solid #1e1e1e" }}
      >
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: current.color }} />
        <span className="text-[#ccc]">{current.label}</span>
        <ChevronDown size={12} className="text-[#555]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 rounded-lg shadow-xl py-1 min-w-[150px]"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", top: pos.top, right: pos.right }}
          >
            {availableStatuses.map((s) => {
              const meta = getContentStatusMeta(s);
              return (
                <button
                  key={s}
                  onClick={() => { onChange(s); setOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 w-full text-left cursor-pointer transition-colors ${
                    s === status ? "bg-[#242424]" : "hover:bg-[#1e1e1e]"
                  }`}
                  style={{ fontSize: "12px", color: "#ccc" }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function FormSection({ title, children, defaultOpen = true, headerPrefix, headerSuffix }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; headerPrefix?: React.ReactNode; headerSuffix?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-[14px]" style={{ backgroundColor: "#111", border: "1px solid #1e1e1e" }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-[43.5px] w-full items-center justify-between px-4 cursor-pointer transition-colors hover:bg-[#141414]"
      >
        <div className="flex min-w-0 items-center gap-2">
          {headerPrefix}
          <span className="truncate text-[#ddd]" style={{ fontSize: "13px", lineHeight: "19.5px" }}>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {headerSuffix}
          {open ? <ChevronUp size={14} className="text-[#555]" /> : <ChevronDown size={14} className="text-[#555]" />}
        </div>
      </button>
      {open && <div className="space-y-4 px-4 pb-4">{children}</div>}
    </div>
  );
}

function DraggableFormSection({
  section,
  index,
  moveSection,
}: {
  section: EditorSection;
  index: number;
  moveSection: (dragIndex: number, hoverIndex: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: FORM_SECTION_DND_TYPE,
    item: (): SectionDragItem => ({ index, type: FORM_SECTION_DND_TYPE }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop<SectionDragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: FORM_SECTION_DND_TYPE,
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveSection(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drag(handleRef);
  drop(ref);

  return (
    <div
      ref={ref}
      className={`rounded-[16px] transition-all ${
        isDragging
          ? "opacity-50 scale-[0.99]"
          : isOver && canDrop
          ? "shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
          : ""
      }`}
    >
      <FormSection
        title={section.title}
        defaultOpen={section.defaultOpen}
        headerPrefix={(
          <span
            ref={handleRef}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex cursor-grab items-center justify-center rounded-md p-1 text-[#555] transition-colors hover:text-[#aaa] active:cursor-grabbing"
            title="Arrastar para reordenar"
          >
            <GripVertical size={13} />
          </span>
        )}
      >
        {section.content}
      </FormSection>
    </div>
  );
}

// Visual Preview with inline editing & live read-only mode
function VisualPreview({ item, contentType, onUpdate, previewMode, readOnly = false }: {
  item: any;
  contentType: ContentType;
  onUpdate: (field: string, value: any) => void;
  previewMode: "desktop" | "mobile";
  readOnly?: boolean;
}) {
  const updateBlock = (index: number, updater: (block: ContentBlock) => ContentBlock) => {
    const blocks = [...(item.contentBlocks || [])];
    if (blocks[index]) {
      blocks[index] = updater(blocks[index]);
      onUpdate("contentBlocks", blocks);
    }
  };

  const renderRichField = (
    field: string,
    text: string,
    placeholder: string,
    className: string,
    style: React.CSSProperties,
    key?: string | number,
    multiline = false,
  ) => {
    if (readOnly) {
      return (
        <div key={key} className={className} style={style}>
          <RichTextContent value={text} placeholder={placeholder} />
        </div>
      );
    }

    return (
      <RichTextEditor
        key={key}
        value={text}
        onChange={(nextValue) => onUpdate(field, nextValue)}
        placeholder={placeholder}
        multiline={multiline}
        compact
        containerClassName="space-y-1"
        editorClassName={`${className} rounded px-1 -mx-1`}
        editorStyle={style}
      />
    );
  };

  const renderBlockRichText = (
    index: number,
    field: string,
    text: string,
    placeholder: string,
    wrapperClassName: string,
    wrapperStyle: React.CSSProperties,
    multiline = true,
  ) => {
    if (readOnly) {
      return (
        <div key={index} className={wrapperClassName} style={wrapperStyle}>
          <RichTextContent value={text} placeholder={placeholder} />
        </div>
      );
    }

    return (
      <RichTextEditor
        key={index}
        value={text}
        onChange={(nextValue) => updateBlock(index, (block) => ({ ...block, [field]: nextValue } as ContentBlock))}
        placeholder={placeholder}
        multiline={multiline}
        compact
        containerClassName="space-y-1"
        editorClassName={`${wrapperClassName} rounded px-1 -mx-1`}
        editorStyle={wrapperStyle}
      />
    );
  };

  const renderPreviewLineHeightControl = (index: number, block: ContentBlock) => {
    if (readOnly || !isAdjustableLineHeightBlock(block)) return null;

    return (
      <LineHeightControl
        compact
        value={getBlockLineHeight(block)}
        onChange={(value) =>
          updateBlock(index, (currentBlock) => ({ ...currentBlock, lineHeight: clampBlockLineHeight(value) } as ContentBlock))
        }
      />
    );
  };

  const renderNestedListItems = (
    blockIndex: number,
    block: Extract<ContentBlock, { type: "unordered-list" | "ordered-list" }>,
    items: ContentListItem[],
    path: number[] = [],
    depth = 0,
  ): React.ReactNode => {
    const ListTag = block.type === "ordered-list" ? "ol" : "ul";
    const lineHeight = getBlockLineHeight(block);

    if (!items.length) return null;

    return (
      <ListTag
        className={depth === 0 ? "pl-5 space-y-1" : "mt-2 pl-5 space-y-1"}
        style={{ listStyleType: getCmsListStyleType(block.type === "ordered-list", depth) }}
      >
        {items.map((listItem, itemIndex) => {
          const itemPath = [...path, itemIndex];
          const children = listItem.children ?? [];

          return (
            <li key={itemPath.join("-")} className="text-[#999]" style={{ fontSize: "14px", lineHeight: `${lineHeight}px` }}>
              {readOnly ? (
                <RichTextContent value={listItem.text} placeholder="Item..." />
              ) : (
                <div className="flex items-start gap-2">
                  <RichTextEditor
                    value={listItem.text}
                    onChange={(nextValue) =>
                      updateBlock(blockIndex, (currentBlock) => {
                        const listBlock = currentBlock as Extract<ContentBlock, { type: "unordered-list" | "ordered-list" }>;
                        return { ...listBlock, items: updateListItemText(listBlock.items, itemPath, nextValue) };
                      })
                    }
                    onEnter={() =>
                      updateBlock(blockIndex, (currentBlock) => {
                        const listBlock = currentBlock as Extract<ContentBlock, { type: "unordered-list" | "ordered-list" }>;
                        return { ...listBlock, items: insertSiblingListItem(listBlock.items, itemPath) };
                      })
                    }
                    onBackspaceEmpty={() =>
                      updateBlock(blockIndex, (currentBlock) => {
                        if (children.length > 0) return currentBlock;
                        const listBlock = currentBlock as Extract<ContentBlock, { type: "unordered-list" | "ordered-list" }>;
                        return { ...listBlock, items: removeListItem(listBlock.items, itemPath) };
                      })
                    }
                    multiline={false}
                    compact
                    placeholder="Item..."
                    containerClassName="flex-1"
                    editorClassName="text-[#999] rounded px-1 -mx-1"
                    editorStyle={{ fontSize: "14px", lineHeight: `${lineHeight}px` }}
                  />
                  <div className="flex shrink-0 items-center gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        updateBlock(blockIndex, (currentBlock) => {
                          const listBlock = currentBlock as Extract<ContentBlock, { type: "unordered-list" | "ordered-list" }>;
                          return { ...listBlock, items: insertSiblingListItem(listBlock.items, itemPath) };
                        })
                      }
                      className="rounded border border-[#2a2a2a] p-1 text-[#555] transition-colors hover:text-white"
                      title="Adicionar item abaixo"
                    >
                      <Plus size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateBlock(blockIndex, (currentBlock) => {
                          const listBlock = currentBlock as Extract<ContentBlock, { type: "unordered-list" | "ordered-list" }>;
                          return { ...listBlock, items: appendChildListItem(listBlock.items, itemPath) };
                        })
                      }
                      className="rounded border border-[#2a2a2a] p-1 text-[#555] transition-colors hover:text-white"
                      title="Adicionar subitem"
                    >
                      <ChevronRight size={11} />
                    </button>
                    {depth > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateBlock(blockIndex, (currentBlock) => {
                            const listBlock = currentBlock as Extract<ContentBlock, { type: "unordered-list" | "ordered-list" }>;
                            return { ...listBlock, items: outdentListItem(listBlock.items, itemPath) };
                          })
                        }
                        className="rounded border border-[#2a2a2a] p-1 text-[#555] transition-colors hover:text-white"
                        title="Voltar um nivel"
                      >
                        <ChevronLeft size={11} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        updateBlock(blockIndex, (currentBlock) => {
                          const listBlock = currentBlock as Extract<ContentBlock, { type: "unordered-list" | "ordered-list" }>;
                          return { ...listBlock, items: removeListItem(listBlock.items, itemPath) };
                        })
                      }
                      className="rounded border border-[#2a2a2a] p-1 text-[#555] transition-colors hover:text-red-400"
                      title="Remover item"
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>
              )}
              {children.length > 0 && renderNestedListItems(blockIndex, block, children, itemPath, depth + 1)}
            </li>
          );
        })}
      </ListTag>
    );
  };

  const isCardPreviewContent = contentType === "projects" || contentType === "articles";
  const cardPreviewTitle =
    !isRichTextEmpty(item.cardTitle || "")
      ? item.cardTitle
      : item.title;
  const cardPreviewSubtitle =
    contentType === "projects"
      ? (!isRichTextEmpty(item.cardSubtitle || "") ? item.cardSubtitle : "")
      : (!isRichTextEmpty(item.cardSubtitle || "") ? item.cardSubtitle : item.description || "");
  const cardPreviewImage = item.cardImage || item.image;
  const cardPreviewImagePosition = item.cardImagePosition || item.imagePosition || "50% 50%";
  const detailPreviewImage = item.image || "";
  const detailPreviewImagePosition = item.imagePosition || "50% 50%";
  const detailTitleText = richTextToPlainText(item.title) || "Preview";
  const detailTitleStyle =
    contentType === "projects"
      ? resolveTextAppearanceStyle(item.titleAppearance, PROJECT_TITLE_APPEARANCE_DEFAULTS)
      : resolveTextAppearanceStyle(item.titleAppearance, ARTICLE_TITLE_APPEARANCE_DEFAULTS);
  const detailSubtitleStyle =
    contentType === "projects"
      ? resolveTextAppearanceStyle(item.subtitleAppearance, PROJECT_SUBTITLE_APPEARANCE_DEFAULTS)
      : resolveTextAppearanceStyle(item.subtitleAppearance, ARTICLE_SUBTITLE_APPEARANCE_DEFAULTS);

  return (
    <div
      className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[14px]"
      style={{ backgroundColor: "#0a0a0a", border: "1px solid #1e1e1e" }}
    >
      {/* Preview toolbar */}
      <div className="flex h-[43.5px] shrink-0 items-center justify-between border-b px-4" style={{ borderColor: "#1e1e1e" }}>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: readOnly ? "#00ff3c" : "#ffa500" }} />
          <span className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16.5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {readOnly ? "Preview ao vivo" : "Preview editavel"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <span className="text-[#444]" style={{ fontSize: "10px" }}>
              Clique no texto para editar inline
            </span>
          )}
          {item.status && (() => {
            const statusMeta = getContentStatusMeta(item.status);
            return (
              <span
                className="inline-flex h-[20.5px] items-center rounded-full px-2"
                style={{
                  fontSize: "10px",
                  lineHeight: "15px",
                  backgroundColor: statusMeta.bg,
                  color: statusMeta.color,
                }}
              >
                {statusMeta.label}
              </span>
            );
          })()}
        </div>
      </div>

      {/* Preview content */}
      <div
        className="flex-1 overflow-y-auto px-5 py-6 md:px-7 md:py-8"
        style={{
          width: "100%",
          maxWidth: previewMode === "mobile" ? "375px" : undefined,
          margin: previewMode === "mobile" ? "0 auto" : undefined,
        }}
      >
        {isCardPreviewContent && (
          <div
            className="mb-8 overflow-hidden rounded-[16px]"
            style={{ backgroundColor: "#101010", border: "1px solid #1e1e1e" }}
          >
            <div
              className="border-b px-4 py-3"
              style={{ borderColor: "#1e1e1e" }}
            >
              <span className="text-[#777]" style={{ fontSize: "11px", lineHeight: "16.5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Previa do card
              </span>
            </div>
            <div className={contentType === "articles" ? "grid gap-0 min-[700px]:grid-cols-[1.1fr,0.9fr]" : ""}>
              <div
                style={contentType === "articles" ? { borderBottom: "1px solid #1e1e1e", borderRight: previewMode === "desktop" ? "1px solid #1e1e1e" : undefined } : undefined}
              >
                <div style={{ aspectRatio: contentType === "projects" ? "700 / 525" : "3 / 2" }}>
                  <ContentImage
                    src={cardPreviewImage}
                    alt={richTextToPlainText(cardPreviewTitle) || detailTitleText}
                    emptyLabel="Sem capa"
                    className="h-full w-full object-cover"
                    position={cardPreviewImagePosition}
                  />
                </div>
              </div>
              <div className="space-y-2 px-4 py-4">
                <p style={{ fontSize: "17px", lineHeight: "25px", color: "#fafafa" }}>
                  <RichTextContent value={cardPreviewTitle} placeholder="Titulo do card" />
                </p>
                {cardPreviewSubtitle && (
                  <p style={{ fontSize: "14px", lineHeight: "21px", color: "#8d8d8d" }}>
                    <RichTextContent value={cardPreviewSubtitle} />
                  </p>
                )}
                {contentType === "projects" && item.category && (
                  <p style={{ fontSize: "12px", lineHeight: "18px", color: "#666" }}>
                    Categoria do case: {item.category}
                  </p>
                )}
                {contentType === "articles" && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[#666]" style={{ fontSize: "12px", lineHeight: "18px" }}>
                    {item.publisher && <span>{item.publisher}</span>}
                    {item.date && <span>{item.date}</span>}
                    {item.category && <span>{item.category}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {item.tags.map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 rounded-md" style={{ fontSize: "11px", backgroundColor: "#1e1e1e", color: "#888" }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        {renderRichField("title", item.title, "Titulo do conteudo", "mb-2 text-[#fafafa]", detailTitleStyle)}

        {/* Subtitle / Description */}
        {(contentType === "projects" || contentType === "articles") &&
          renderRichField(
            "subtitle",
            contentType === "projects" ? item.subtitle : (item.subtitle || ""),
            "Subtitulo...",
            "mb-6 text-[#4f4f4f]",
            detailSubtitleStyle
          )
        }

        {/* Cover image */}
        {detailPreviewImage && (
          <div className="mb-8 overflow-hidden rounded-[12px]" style={{ backgroundColor: item.imageBgColor || "transparent" }}>
            <ContentImage
              src={detailPreviewImage}
              alt={detailTitleText}
              className="w-full object-cover"
              position={detailPreviewImagePosition}
              style={{ maxHeight: "220px" }}
            />
          </div>
        )}

        {/* Meta info for projects */}
        {contentType === "projects" && (
          <div
            className="flex flex-wrap items-center gap-5 border-y py-3"
            style={{
              borderColor: "#1e1e1e",
              fontSize: "12px",
              lineHeight: "18px",
              color: "#666",
              marginBottom: `${item.infoDividerSpacing ?? 48}px`,
            }}
          >
            <span>Cliente: {item.client || "—"}</span>
            <span>Ano: {item.year || "—"}</span>
            <span>Servicos: {item.services || "—"}</span>
            {item.link && item.link !== "#" && (
              <span className="flex items-center gap-1"><Globe size={10} /><span className="truncate max-w-[120px]">{item.link}</span></span>
            )}
          </div>
        )}

        {/* Meta info for articles */}
        {contentType === "articles" && (
          <div className="mb-6 flex flex-wrap items-center gap-5 border-y py-3" style={{ borderColor: "#1e1e1e", fontSize: "12px", lineHeight: "18px", color: "#666" }}>
            <span>Autor: {item.author || "—"}</span>
            <span>Data: {item.date || "—"}</span>
            <span>Leitura: {item.readTime || "—"}</span>
            {item.publisher && <span>Publicacao: {item.publisher}</span>}
            {item.category && <span>Categoria: {item.category}</span>}
          </div>
        )}

        {/* Password indicator */}
        {item.password && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg" style={{ backgroundColor: "#ffa50010", border: "1px solid #ffa50020" }}>
            <Lock size={12} className="text-[#ffa500]" />
            <span style={{ fontSize: "11px", color: "#ffa500" }}>Protegido por senha</span>
          </div>
        )}

        {/* Content blocks */}
        <div className="space-y-6">
          {(item.contentBlocks || []).map((block: ContentBlock, i: number) => {
            if (isShowcaseBlock(block)) {
              return <ShowcaseBlockView key={i} block={block} variant="preview" />;
            }

            switch (block.type) {
              case "heading1":
                return (
                  <div key={i} className="space-y-2">
                    {renderPreviewLineHeightControl(i, block)}
                    {renderBlockRichText(i, "text", block.text, "Titulo H1...", "text-[#fafafa]", { fontSize: "22px", lineHeight: `${getBlockLineHeight(block)}px`, fontWeight: 500 })}
                  </div>
                );
              case "heading2":
                return (
                  <div key={i} className="space-y-2">
                    {renderPreviewLineHeightControl(i, block)}
                    {renderBlockRichText(i, "text", block.text, "Titulo H2...", "text-[#fafafa]", { fontSize: "18px", lineHeight: `${getBlockLineHeight(block)}px`, fontWeight: 500 })}
                  </div>
                );
              case "heading3":
                return (
                  <div key={i} className="space-y-2">
                    {renderPreviewLineHeightControl(i, block)}
                    {renderBlockRichText(i, "text", block.text, "Titulo H3...", "text-[#fafafa]", { fontSize: "16px", lineHeight: `${getBlockLineHeight(block)}px`, fontWeight: 500 })}
                  </div>
                );
              case "paragraph":
                return (
                  <div key={i} className="space-y-2">
                    {renderPreviewLineHeightControl(i, block)}
                    {renderBlockRichText(i, "text", block.text, "Escreva seu texto aqui...", "text-[#999]", { fontSize: "14px", lineHeight: `${getBlockLineHeight(block)}px` })}
                  </div>
                );
              case "unordered-list":
              case "ordered-list": {
                return (
                  <div key={i} className="space-y-2">
                    {renderPreviewLineHeightControl(i, block)}
                    {renderNestedListItems(i, block, block.items)}
                  </div>
                );
              }
              case "code":
                return (
                  <div
                    key={i}
                    className="overflow-hidden rounded-xl"
                    style={{ backgroundColor: "#111", border: "1px solid #1e1e1e" }}
                  >
                    <div
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-2"
                      style={{ borderBottom: "1px solid #1e1e1e" }}
                    >
                      {readOnly ? (
                        <span className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {getCodeLanguageLabel(block.language)}
                        </span>
                      ) : (
                        <select
                          value={block.language}
                          onChange={(event) => updateBlock(i, (currentBlock) => ({ ...currentBlock, language: event.target.value } as ContentBlock))}
                          className="h-[30px] rounded border px-2 text-[#fafafa] focus:outline-none"
                          style={{ backgroundColor: "#141414", borderColor: "#2a2a2a", fontSize: "12px" }}
                        >
                          {CODE_LANGUAGE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    {readOnly ? (
                      <CodeHighlight code={block.code} language={block.language} variant="editor" />
                    ) : (
                      <CodeHighlight
                        code={block.code}
                        language={block.language}
                        variant="editor"
                        editable
                        minHeight={180}
                        placeholder="// cole seu codigo aqui"
                        onChange={(nextCode) =>
                          updateBlock(i, (currentBlock) => ({ ...currentBlock, code: nextCode } as ContentBlock))
                        }
                      />
                    )}
                    {block.caption && (
                      <div className="border-t px-4 py-2 text-[#666]" style={{ borderColor: "#1e1e1e", fontSize: "12px" }}>
                        <RichTextContent value={block.caption} />
                      </div>
                    )}
                  </div>
                );
              case "image":
                return block.url || (block.galleryImages || []).some(Boolean) ? (
                  <figure key={i} className="my-6">
                    {(block.galleryImages || []).filter(Boolean).length > 0 ? (
                      <PreviewMediaSlider
                        title={richTextToPlainText(block.caption) || item.title || "Imagem"}
                        image={block.url}
                        imagePosition={block.position || "50% 50%"}
                        galleryImages={block.galleryImages || []}
                        galleryPositions={block.galleryPositions || []}
                        aspectRatio="16 / 10"
                        frameClassName="rounded-lg"
                        frameStyle={{ borderRadius: `${block.borderRadius ?? 8}px` }}
                        disablePointerEvents={false}
                        emptyLabel="Imagem"
                      />
                    ) : (
                      <ContentImage
                        src={block.url}
                        alt={richTextToPlainText(block.caption) || ""}
                        className="w-full rounded-lg object-cover max-h-[300px]"
                        position={block.position || "50% 50%"}
                        style={{ borderRadius: `${block.borderRadius ?? 8}px` }}
                      />
                    )}
                    {block.caption && (
                      <figcaption className="text-center mt-2 text-[#666]" style={{ fontSize: "12px" }}>
                        <RichTextContent value={block.caption} />
                      </figcaption>
                    )}
                  </figure>
                ) : (
                  <div key={i} className="rounded-lg py-8 text-center" style={{ backgroundColor: "#141414", border: "1px dashed #2a2a2a" }}>
                    <span className="text-[#555]" style={{ fontSize: "13px" }}>Imagem</span>
                  </div>
                );
              case "video": {
                const vBlock = block as any;
                return vBlock.url ? (
                  <figure key={i} className="my-6">
                    <VideoPlayer
                      src={vBlock.url}
                      poster={vBlock.poster || undefined}
                      autoPlay={vBlock.autoplay || false}
                      loop={vBlock.loop || false}
                      muted={vBlock.muted || vBlock.autoplay || false}
                      height={300}
                      fit={vBlock.fit || "contain"}
                      zoom={vBlock.zoom ?? 1}
                    />
                    {vBlock.caption && (
                      <figcaption className="text-center mt-2 text-[#666]" style={{ fontSize: "12px" }}>{vBlock.caption}</figcaption>
                    )}
                  </figure>
                ) : (
                  <div key={i} className="rounded-lg py-8 text-center flex flex-col items-center gap-1" style={{ backgroundColor: "#141414", border: "1px dashed #2a2a2a" }}>
                    <Video size={18} className="text-[#555]" />
                    <span className="text-[#555]" style={{ fontSize: "13px" }}>Video</span>
                  </div>
                );
              }
              case "quote":
                return (
                  <div key={i} className="space-y-2">
                    {renderPreviewLineHeightControl(i, block)}
                    <blockquote className="border-l-2 pl-4 py-2 my-6" style={{ borderColor: sanitizeAppearanceColor(block.accentColor || "") || "#00ff3c" }}>
                      {renderBlockRichText(i, "text", (block as any).text, "Texto da citacao...", "text-[#ccc] italic", { fontSize: "15px", lineHeight: `${getBlockLineHeight(block)}px` })}
                      {(block as any).author && (
                        <cite className="text-[#666] not-italic block mt-2" style={{ fontSize: "12px" }}>— {(block as any).author}</cite>
                      )}
                    </blockquote>
                  </div>
                );
              case "divider":
                return (
                  <hr
                    key={i}
                    style={{
                      borderColor: "#1e1e1e",
                      marginTop: `${getDividerSpacing(block)}px`,
                      marginBottom: `${getDividerSpacing(block)}px`,
                    }}
                  />
                );
              case "cta":
                return (
                  <div key={i} className="space-y-2">
                    {renderPreviewLineHeightControl(i, block)}
                    <div className="rounded-xl p-6 text-center my-6" style={{ backgroundColor: "#141414", border: "1px solid #1e1e1e" }}>
                      {renderBlockRichText(i, "text", (block as any).text, "Texto do CTA...", "text-[#ccc] mb-3", { fontSize: "15px", lineHeight: `${getBlockLineHeight(block)}px` })}
                      {readOnly ? (
                        <span className="inline-block rounded-lg bg-[#fafafa] px-4 py-2 text-[#111] cursor-pointer" style={{ fontSize: "13px" }}>
                          <RichTextContent value={(block as any).buttonText || "Botao"} />
                        </span>
                      ) : (
                        <RichTextEditor
                          value={(block as any).buttonText || ""}
                          onChange={(nextValue) => updateBlock(i, (currentBlock) => ({ ...currentBlock, buttonText: nextValue } as ContentBlock))}
                          placeholder="Texto do botao"
                          multiline={false}
                          compact
                          allowLinks={false}
                          editorClassName="mx-auto inline-block rounded-lg bg-[#fafafa] px-4 py-2 text-[#111]"
                          editorStyle={{ fontSize: "13px", minHeight: "38px" }}
                        />
                      )}
                    </div>
                  </div>
                );
              case "embed":
                return <ContentEmbed key={i} block={block} preview />;
              default:
                return null;
            }
          })}
        </div>

        {(!item.contentBlocks || item.contentBlocks.length === 0) && (
          <div className="pt-16 text-center text-[#3f3f3f]" style={{ fontSize: "13px", lineHeight: "19.5px" }}>
            Adicione blocos de conteudo no formulario
          </div>
        )}

        {/* Gallery images */}
        {item.galleryImages && item.galleryImages.length > 0 && (
          <div className="mt-8 pt-6 border-t" style={{ borderColor: "#1e1e1e" }}>
            <span className="text-[#555] block mb-3" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Galeria</span>
            <div className="grid grid-cols-2 gap-2">
              {item.galleryImages.map((img: string, idx: number) => (
                <div key={idx} className="rounded-lg overflow-hidden" style={{ aspectRatio: "16/10" }}>
                  <ContentImage
                    src={img}
                    alt={`Galeria ${idx + 1}`}
                    className="w-full h-full object-cover"
                    position={item.galleryPositions?.[idx] || "50% 50%"}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ImageUrlField({
  label,
  value,
  onChange,
  placeholder,
  galleryImages = [],
  onGalleryImagesChange,
  galleryPositions = [],
  onGalleryPositionsChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  galleryImages?: string[];
  onGalleryImagesChange?: (values: string[]) => void;
  galleryPositions?: string[];
  onGalleryPositionsChange?: (positions: string[]) => void;
}) {
  const { addMediaItem } = useCMS();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const hasGallerySupport = Boolean(onGalleryImagesChange);

  const appendToGallery = (incomingImages: string[]) => {
    if (!onGalleryImagesChange) return 0;

    const seen = new Set(galleryImages);
    if (value?.trim()) seen.add(value.trim());

    const nextGalleryImages = [...galleryImages];
    const nextGalleryPositions = [...galleryPositions];
    let addedCount = 0;

    incomingImages.forEach((image) => {
      const normalized = image.trim();
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      nextGalleryImages.push(normalized);
      nextGalleryPositions.push("50% 50%");
      addedCount += 1;
    });

    if (addedCount > 0) {
      onGalleryImagesChange(nextGalleryImages);
      onGalleryPositionsChange?.(nextGalleryPositions);
    }

    return addedCount;
  };

  const applyIncomingImages = (incomingImages: string[]) => {
    const normalizedImages = incomingImages.map((image) => image.trim()).filter(Boolean);
    if (!normalizedImages.length) return { coverUpdated: false, galleryAdded: 0 };

    if (!onGalleryImagesChange) {
      onChange(normalizedImages[0]);
      return { coverUpdated: true, galleryAdded: 0 };
    }

    if (normalizedImages.length === 1) {
      onChange(normalizedImages[0]);
      return { coverUpdated: true, galleryAdded: 0 };
    }

    if (value?.trim()) {
      return { coverUpdated: false, galleryAdded: appendToGallery(normalizedImages) };
    }

    onChange(normalizedImages[0]);
    return { coverUpdated: true, galleryAdded: appendToGallery(normalizedImages.slice(1)) };
  };

  const handleUpload = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((file) => isSupportedVisualUpload(file));
    if (!imageFiles.length) return;

    setUploading(true);
    try {
      const uploadedImages: string[] = [];

      for (const file of imageFiles) {
        try {
          const uploaded = await dataProvider.uploadMedia(file, "public");
          addMediaItem(uploaded);
          uploadedImages.push(uploaded.url);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : `Nao foi possivel enviar ${file.name}.`);
        }
      }

      if (!uploadedImages.length) return;

      const result = applyIncomingImages(uploadedImages);
      if (uploadedImages.length === 1) {
        toast.success("Asset visual enviado em qualidade original.");
      } else if (result.coverUpdated && result.galleryAdded > 0) {
        toast.success(`Capa atualizada e ${result.galleryAdded} assets enviados para a galeria.`);
      } else if (result.galleryAdded > 0) {
        toast.success(`${result.galleryAdded} assets adicionados na galeria.`);
      } else {
        toast.info("Os assets selecionados ja estavam cadastrados.");
      }
    } catch {
      toast.error("Nao foi possivel carregar os assets visuais.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length) {
      void handleUpload(event.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[#777]" style={{ fontSize: "11px", lineHeight: "16.5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </label>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="rounded-[12px] border p-2 transition-colors"
        style={{
          borderColor: dragOver ? "#3b82f6" : "#1e1e1e",
          backgroundColor: dragOver ? "#111827" : "transparent",
          borderStyle: dragOver ? "solid" : "dashed",
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <SelectionProtectedInput
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="h-[37.5px] min-w-0 flex-1 rounded-[10px] px-3 text-[#fafafa] placeholder:text-[#ababab] focus:outline-none transition-colors"
            style={{ fontSize: "13px", lineHeight: "19.5px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-[37.5px] items-center gap-1.5 rounded-[10px] px-3 text-[#ddd] transition-colors hover:bg-[#1a1a1a]"
            style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}
          >
            <Upload size={12} />
            {uploading ? "Enviando..." : "Upload original"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex h-[37.5px] items-center gap-1.5 rounded-[10px] px-3 text-[#999] transition-colors hover:text-red-400"
              style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}
            >
              <X size={12} />
              Limpar
            </button>
          )}
        </div>
        <p className="mt-2 px-1 text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
          {hasGallerySupport
            ? dragOver
              ? "Solte aqui para atualizar a capa e enviar o restante para a galeria."
              : "Arraste uma ou varias capas visuais aqui. A primeira vira capa e as demais vao para a galeria."
            : dragOver
              ? "Solte aqui para atualizar esta imagem."
              : "Arraste uma imagem visual aqui para atualizar este campo."}
        </p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*,application/json,.json,.lottie"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) void handleUpload(event.target.files);
          event.currentTarget.value = "";
        }}
      />
      <p className="text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
        Aceita WebM, Lottie JSON, SVG, WebP animado e imagens estaticas. Os arquivos sao enviados no original, sem compressao.
      </p>
    </div>
  );
}

function NonPositionableGalleryAssetCard({
  src,
  index,
  onRemove,
  canMoveBackward,
  canMoveForward,
  onMoveBackward,
  onMoveForward,
}: {
  src: string;
  index: number;
  onRemove: () => void;
  canMoveBackward?: boolean;
  canMoveForward?: boolean;
  onMoveBackward?: () => void;
  onMoveForward?: () => void;
}) {
  const assetKind = inferVisualAssetKind(src);
  const label = assetKind === "video" ? "Animacao WebM / video" : assetKind === "lottie" ? "Lottie JSON" : "Midia";

  return (
    <div
      className="overflow-hidden rounded-[12px] border"
      style={{ borderColor: "#1e1e1e", backgroundColor: "#101010" }}
    >
      <div style={{ height: "160px" }}>
        <ContentImage
          src={src}
          alt={`Galeria ${index + 1}`}
          className="h-full w-full object-cover"
          style={{ backgroundColor: "#0f0f0f" }}
        />
      </div>
      <div
        className="flex items-center justify-between gap-2 border-t px-2 py-2"
        style={{ borderColor: "#1e1e1e" }}
      >
        <div className="min-w-0">
          <p className="truncate text-[#aaa]" style={{ fontSize: "11px", lineHeight: "16px" }}>
            {label}
          </p>
          <p className="text-[#555]" style={{ fontSize: "10px", lineHeight: "15px" }}>
            Sem reposicionamento manual
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveBackward}
            disabled={!canMoveBackward}
            className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-[#777] transition-colors hover:bg-[#1a1a1a] hover:text-[#fafafa] disabled:opacity-30"
          >
            <ChevronUp size={12} />
          </button>
          <button
            type="button"
            onClick={onMoveForward}
            disabled={!canMoveForward}
            className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-[#777] transition-colors hover:bg-[#1a1a1a] hover:text-[#fafafa] disabled:opacity-30"
          >
            <ChevronDown size={12} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-[#777] transition-colors hover:bg-[#1a1a1a] hover:text-red-400"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Gallery Images Editor
function GalleryEditor({ images, onChange, positions, onPositionsChange }: { images: string[]; onChange: (imgs: string[]) => void; positions?: string[]; onPositionsChange?: (positions: string[]) => void }) {
  const { addMediaItem } = useCMS();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const moveItem = <T,>(items: T[], fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return items;
    const nextItems = [...items];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem);
    return nextItems;
  };

  const appendImages = (incomingImages: string[]) => {
    const seen = new Set(images);
    const nextImages = [...images];
    const nextPositions = [...(positions || [])];
    let addedCount = 0;

    incomingImages.forEach((image) => {
      const normalized = image.trim();
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      nextImages.push(normalized);
      nextPositions.push("50% 50%");
      addedCount += 1;
    });

    onChange(nextImages);
    if (onPositionsChange && addedCount > 0) {
      onPositionsChange(nextPositions);
    }
    return addedCount;
  };

  const parseImageUrls = (value: string) =>
    value
      .split(/\r?\n|,/)
      .map((entry) => entry.trim())
      .filter(Boolean);

  const handleUpload = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((file) => isSupportedVisualUpload(file));
    if (!imageFiles.length) return;
    setUploading(true);
    const uploadedImages: string[] = [];

    try {
      for (const file of imageFiles) {
        try {
          const uploaded = await dataProvider.uploadMedia(file, "public");
          addMediaItem(uploaded);
          uploadedImages.push(uploaded.url);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : `Nao foi possivel enviar ${file.name}.`);
        }
      }

      if (!uploadedImages.length) return;

      const addedCount = appendImages(uploadedImages);
      if (addedCount > 0) {
        toast.success(addedCount === 1 ? "Asset adicionado em qualidade original." : `${addedCount} assets adicionados.`);
      } else {
        toast.info("Os assets selecionados ja estavam na galeria.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrls = () => {
    const nextUrls = parseImageUrls(urlInput);
    if (!nextUrls.length) {
      toast.error("Cole pelo menos uma URL de midia visual.");
      return;
    }

    const addedCount = appendImages(nextUrls);
    setUrlInput("");
    if (addedCount > 0) {
      toast.success(addedCount === 1 ? "URL adicionada na galeria." : `${addedCount} URLs adicionadas na galeria.`);
    } else {
      toast.info("As URLs informadas ja estavam na galeria.");
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, j) => j !== index));
    if (positions && onPositionsChange) {
      const newPositions = [...(positions || [])];
      newPositions.splice(index, 1);
      onPositionsChange(newPositions);
    }
  };

  const handlePositionChange = (index: number, position: string) => {
    if (!onPositionsChange) return;
    const newPositions = [...(positions || [])];
    // Pad array if needed
    while (newPositions.length <= index) newPositions.push("50% 50%");
    newPositions[index] = position;
    onPositionsChange(newPositions);
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    onChange(moveItem(images, fromIndex, toIndex));

    if (onPositionsChange) {
      const safePositions = images.map((_, index) => positions?.[index] || "50% 50%");
      onPositionsChange(moveItem(safePositions, fromIndex, toIndex));
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length) {
      void handleUpload(event.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Galeria visual</label>
        <p className="text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
          Adicione assets extras por upload ou URL para montar a galeria do case ou artigo.
        </p>
        <p className="text-[#444]" style={{ fontSize: "10px", lineHeight: "15px" }}>
          Imagens continuam com reposicionamento. Videos e Lotties ficam centralizados para preservar performance e nitidez.
        </p>
      </div>
      <div className="rounded-[12px] border p-2.5" style={{ borderColor: "#1e1e1e", backgroundColor: "#101010" }}>
        <div className="flex flex-col gap-2 min-[1080px]:flex-row">
          <SelectionProtectedTextarea
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            placeholder={"Cole uma ou varias URLs de imagem, WebM ou Lottie\nUma por linha ou separadas por virgula"}
            rows={3}
            className="min-h-[84px] flex-1 resize-none rounded-[10px] px-3 py-2 text-[#fafafa] placeholder:text-[#666] focus:outline-none transition-colors"
            style={{ fontSize: "13px", lineHeight: "19.5px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
          />
          <div className="flex gap-2 min-[1080px]:w-[230px] min-[1080px]:flex-col">
            <button
              type="button"
              onClick={handleAddUrls}
              className="inline-flex h-[40px] flex-1 items-center justify-center gap-1.5 rounded-[10px] px-3 text-[#ddd] transition-colors hover:bg-[#1a1a1a]"
              style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}
            >
              <Plus size={12} />
              Adicionar URL(s)
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex h-[40px] flex-1 items-center justify-center gap-1.5 rounded-[10px] px-3 text-[#ddd] transition-colors hover:bg-[#1a1a1a]"
              style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}
            >
              <Upload size={12} />
              {uploading ? "Enviando..." : "Upload multiplo"}
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {images.map((img, i) => (
          supportsPositionEditor(img) ? (
            <ImagePositionEditorCompact
              key={i}
              src={img}
              alt={`Galeria ${i + 1}`}
              position={(positions && positions[i]) || "50% 50%"}
              onChange={(pos) => handlePositionChange(i, pos)}
              onRemove={() => handleRemove(i)}
              height={160}
              canMoveBackward={i > 0}
              canMoveForward={i < images.length - 1}
              onMoveBackward={() => handleMove(i, i - 1)}
              onMoveForward={() => handleMove(i, i + 1)}
            />
          ) : (
            <NonPositionableGalleryAssetCard
              key={i}
              src={img}
              index={i}
              onRemove={() => handleRemove(i)}
              canMoveBackward={i > 0}
              canMoveForward={i < images.length - 1}
              onMoveBackward={() => handleMove(i, i - 1)}
              onMoveForward={() => handleMove(i, i + 1)}
            />
          )
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className="rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors hover:bg-[#1a1a1a]"
          style={{
            height: "160px",
            border: `1px dashed ${dragOver ? "#3b82f6" : "#2a2a2a"}`,
            backgroundColor: dragOver ? "#111827" : "transparent",
          }}
        >
          <Upload size={14} className="text-[#555]" />
          <span className="text-[#555]" style={{ fontSize: "11px" }}>
            {uploading ? "Enviando..." : dragOver ? "Solte para adicionar" : "Adicionar mais"}
          </span>
          <span className="text-[#444]" style={{ fontSize: "10px" }}>
            Clique ou arraste assets
          </span>
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*,application/json,.json,.lottie"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handleUpload(e.target.files);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}

export function CMSEditor() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const contentType = type as ContentType;
  const navigate = useNavigate();
  const { data, updateProjects, updateBlogPosts, updatePages, updateSiteSettings } = useCMS();

  const [mode, setMode] = useState<EditorMode>("split");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [hasChanges, setHasChanges] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Get current item
  const getItem = useCallback(() => {
    if (contentType === "projects") return data.projects.find(p => p.id === id);
    if (contentType === "articles") return data.blogPosts.find(b => b.id === id);
    if (contentType === "pages") return (data.pages || []).find(p => p.id === id);
    return null;
  }, [contentType, id, data]);

  const [item, setItem] = useState<any>(() => {
    const found = getItem();
    if (!found) return null;
    return contentType === "projects"
      ? attachProjectCardFields(found as Project, data.siteSettings)
      : contentType === "articles"
      ? attachBlogPostCardFields(found as BlogPost, data.siteSettings)
      : { ...found };
  });
  const visibilityCollection = contentType === "projects" ? "projects" : contentType === "articles" ? "blogPosts" : "pages";
  const visibilityKey = getPublicContentVisibilityKey(visibilityCollection, id || "");
  const isItemVisible = data.siteSettings.contentVisibility?.[visibilityKey] !== false;

  const setItemVisible = (visible: boolean) => {
    const nextVisibility = { ...(data.siteSettings.contentVisibility || {}) };

    if (visible) {
      delete nextVisibility[visibilityKey];
    } else {
      nextVisibility[visibilityKey] = false;
    }

    updateSiteSettings({
      ...data.siteSettings,
      contentVisibility: nextVisibility,
    });
  };

  // Autosave timer
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasChanges || !item) return;
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => {
      void saveItem(true);
    }, CMS_AUTOSAVE_DELAY_MS);
    return () => { if (autosaveRef.current) clearTimeout(autosaveRef.current); };
  }, [item, hasChanges]);

  useEffect(() => {
    if (!hasChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  // Keyboard shortcuts: Ctrl+Z (undo via history)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;

      // Ctrl+Z — undo (restore latest version from history)
      if (isMod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        // Only intercept when not inside a text input/textarea (let browser handle native undo there)
        const target = e.target as HTMLElement;
        const isEditable = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
        if (!isEditable && id) {
          e.preventDefault();
          void getVersions(`${contentType}-${id}`).then((versions) => {
            if (versions.length > 0) {
              const latest = versions[0];
              setItem({ ...latest.data, updatedAt: new Date().toISOString() });
              setHasChanges(true);
              toast.success("Desfeito! Estado anterior restaurado.");
            } else {
              toast.info("Nenhuma versao anterior para desfazer.");
            }
          });
        }
      }

      // Ctrl+Shift+H — toggle history panel
      if (isMod && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setShowHistory(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [id, contentType]);

  if (!item) {
    return (
      <div className="max-w-[600px] mx-auto text-center py-20">
        <p className="text-[#666]" style={{ fontSize: "14px" }}>Conteudo nao encontrado</p>
        <Link to={`/content/${contentType}`} className="text-[#888] hover:text-[#fafafa] transition-colors mt-4 inline-block" style={{ fontSize: "13px" }}>
          <ArrowLeft size={14} className="inline mr-1" /> Voltar
        </Link>
      </div>
    );
  }

  const updateField = (field: string, value: any) => {
    setItem((prev: any) => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }));
    setHasChanges(true);
  };

  const buildUniqueSlug = async () => {
    const collection = contentType === "projects" ? "projects" : contentType === "articles" ? "blogPosts" : "pages";
    const localItems =
      collection === "projects" ? data.projects :
      collection === "blogPosts" ? data.blogPosts :
      data.pages || [];

    const baseSlug = slugify(item.slug || item.title || id || "item");
    if (collection === "pages" && isReservedPageSlug(baseSlug)) {
      throw new Error("Este slug e reservado para rotas do sistema.");
    }

    const siblingSlugs = localItems
      .filter((entry) => entry.id !== id)
      .map((entry) => entry.slug)
      .filter(Boolean);

    let candidate = ensureUniqueSlug(baseSlug, siblingSlugs);
    let attempt = 2;

    while (!(await dataProvider.isSlugAvailable(collection, candidate, id))) {
      candidate = `${baseSlug}-${attempt}`;
      attempt += 1;
    }

    return candidate;
  };

  const saveItem = async (silent = false, draft = item) => {
    if (!draft) return;
    try {
      const normalizedSlug = await buildUniqueSlug();
      const nextUpdatedAt = new Date().toISOString();
      const nextItem = {
        ...draft,
        slug: normalizedSlug,
        publishedAt: draft.status === "published" ? draft.publishedAt || new Date().toISOString() : null,
        updatedAt: nextUpdatedAt,
      };

      // Save version before persisting
      const versionLabel = silent ? "Autosave" : "Salvo manualmente";
      if (id) saveVersion(`${contentType}-${id}`, nextItem, versionLabel);

      if (contentType === "projects") {
        const { project: persistedProject, override } = splitProjectCardFields(nextItem as Project & ProjectEditorFields);
        const projectId = persistedProject.id;
        const nextProjectCardOverrides = { ...(data.siteSettings.projectCardOverrides || {}) };
        const nextSiteSettings = {
          ...data.siteSettings,
          projectCardOverrides: nextProjectCardOverrides,
          updatedAt: nextUpdatedAt,
        };

        if (override) {
          nextProjectCardOverrides[projectId] = override;
        } else {
          delete nextProjectCardOverrides[projectId];
        }

        updateProjects(data.projects.map((project) => (project.id === id ? nextItem as Project : project)));
        updateSiteSettings(nextSiteSettings);
        setItem(attachProjectCardFields(persistedProject, nextSiteSettings));
      } else if (contentType === "articles") {
        const { post: persistedPost, override } = splitBlogPostCardFields(nextItem as BlogPost & BlogPostEditorFields);
        const postId = persistedPost.id;
        const nextBlogPostCardOverrides = { ...(data.siteSettings.blogPostCardOverrides || {}) };
        const nextSiteSettings = {
          ...data.siteSettings,
          blogPostCardOverrides: nextBlogPostCardOverrides,
          updatedAt: nextUpdatedAt,
        };

        if (override) {
          nextBlogPostCardOverrides[postId] = override;
        } else {
          delete nextBlogPostCardOverrides[postId];
        }

        updateBlogPosts(data.blogPosts.map((post) => (post.id === id ? nextItem : post)));
        updateSiteSettings(nextSiteSettings);
        setItem(attachBlogPostCardFields(persistedPost, nextSiteSettings));
      } else if (contentType === "pages") {
        updatePages((data.pages || []).map((page) => (page.id === id ? nextItem : page)));
        setItem(nextItem);
      }
      setHasChanges(false);
      if (!silent) toast.success("Salvo!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  };

  const publish = () => {
    // Save version as published
    const publishedItem = {
      ...item,
      status: "published" as const,
      publishedAt: new Date().toISOString(),
    };
    if (id) saveVersion(`${contentType}-${id}`, publishedItem, "Publicado");
    setItem(publishedItem);
    setHasChanges(true);
    void saveItem(false, publishedItem);
    toast.success("Publicado!");
  };

  useEffect(() => {
    const handleShortcutSave = (event: Event) => {
      if (!item) return;
      event.preventDefault();
      void saveItem(false);
    };

    window.addEventListener(CMS_SAVE_SHORTCUT_EVENT, handleShortcutSave);
    return () => window.removeEventListener(CMS_SAVE_SHORTCUT_EVENT, handleShortcutSave);
  }, [item, saveItem]);

  const handleRestoreVersion = (versionData: Record<string, any>) => {
    setItem({ ...versionData, updatedAt: new Date().toISOString() });
    setHasChanges(true);
    toast.success("Versao restaurada! Salve para confirmar.");
  };

  const modeButtons: { key: EditorMode; label: string; icon: typeof PanelLeft }[] = [
    { key: "form", label: "Formulario", icon: PanelLeft },
    { key: "split", label: "Dividido", icon: Columns },
    { key: "visual", label: "Visual", icon: Eye },
  ];

  const [sectionOrder, setSectionOrder] = useState<string[]>(() => readSectionOrder(contentType));

  useEffect(() => {
    setSectionOrder(readSectionOrder(contentType));
  }, [contentType]);

  useEffect(() => {
    writeSectionOrder(contentType, normalizeSectionOrder(sectionOrder, DEFAULT_SECTION_ORDER[contentType]));
  }, [contentType, sectionOrder]);

  const moveSection = useCallback((dragIndex: number, hoverIndex: number) => {
    setSectionOrder((current) => {
      const normalized = normalizeSectionOrder(current, DEFAULT_SECTION_ORDER[contentType]);
      const next = [...normalized];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(hoverIndex, 0, moved);
      return next;
    });
  }, [contentType]);

  const renderSectionList = (sections: EditorSection[]) => {
    const availableKeys = sections.map((section) => section.key);
    const normalizedOrder = normalizeSectionOrder(sectionOrder, availableKeys);
    const sectionMap = new Map(sections.map((section) => [section.key, section]));
    const orderedSections = normalizedOrder
      .map((key) => sectionMap.get(key))
      .filter((section): section is EditorSection => Boolean(section));

    return (
      <div className="space-y-4">
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] px-4 py-3"
          style={{ backgroundColor: "#111", border: "1px solid #1e1e1e" }}
        >
          <div>
            <p className="text-[#ddd]" style={{ fontSize: "13px", lineHeight: "19.5px" }}>
              Estrutura do editor
            </p>
            <p className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16.5px" }}>
              Arraste os paineis para mudar a ordem desta tela.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSectionOrder(DEFAULT_SECTION_ORDER[contentType])}
            className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[#888] transition-colors hover:text-[#fafafa]"
            style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}
          >
            <RotateCcw size={12} />
            Resetar ordem
          </button>
        </div>

        <DndProvider backend={HTML5Backend}>
          <div className="space-y-4">
            {orderedSections.map((section, index) => (
              <DraggableFormSection
                key={section.key}
                section={section}
                index={index}
                moveSection={moveSection}
              />
            ))}
          </div>
        </DndProvider>
      </div>
    );
  };

  // Form for projects
  const renderProjectForm = () => (
    renderSectionList([
      {
        key: "basics",
        title: "Informacoes basicas",
        content: (
          <>
        <RichTextField
          label="Titulo completo do case"
          value={item.title}
          onChange={(v) => updateField("title", v)}
          placeholder="Nome completo que aparece na pagina do projeto"
          helperText="Clique no texto para abrir a mesma barra de estilo dos blocos de conteudo."
        />
        <RichTextField
          label="Subtitulo do case"
          value={item.subtitle || ""}
          onChange={(v) => updateField("subtitle", v)}
          placeholder="Texto opcional abaixo do titulo da pagina"
          helperText="Aceita destaque, cor, tamanho inline e demais estilos do editor rico."
        />
        <div className="space-y-4">
          <TextAppearanceControl
            label="Aparencia do titulo da pagina"
            value={item.titleAppearance}
            onChange={(value) => updateField("titleAppearance", value)}
            defaults={PROJECT_TITLE_APPEARANCE_DEFAULTS}
            defaultColorValue="#EDEDED"
            sample={richTextToPlainText(item.title) || "Titulo do case"}
            fontSizeRange={{ min: 20, max: 72 }}
            responsiveLimits={DETAIL_PAGE_TITLE_RESPONSIVE_LIMITS}
          />
          <TextAppearanceControl
            label="Aparencia do subtitulo da pagina"
            value={item.subtitleAppearance}
            onChange={(value) => updateField("subtitleAppearance", value)}
            defaults={PROJECT_SUBTITLE_APPEARANCE_DEFAULTS}
            defaultColorValue="#A6A6A6"
            sample={richTextToPlainText(item.subtitle) || "Subtitulo do case"}
            fontSizeRange={{ min: 14, max: 40 }}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 min-[1180px]:grid-cols-2">
          <RichTextField
            label="Titulo do card"
            value={item.cardTitle || ""}
            onChange={(v) => updateField("cardTitle", v)}
            placeholder="Versao curta para home e listagem"
          />
          <RichTextField
            label="Subtitulo do card (opcional)"
            value={item.cardSubtitle || ""}
            onChange={(v) => updateField("cardSubtitle", v)}
            placeholder="Se vazio, o card nao mostra subtitulo"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 min-[1180px]:grid-cols-2">
          <Input label="Slug (URL)" value={item.slug || ""} onChange={(v) => updateField("slug", slugify(v))} placeholder="meu-projeto" />
          <Input label="Categoria do case" value={item.category} onChange={(v) => updateField("category", v)} placeholder="Web Design" />
        </div>
        <div className="grid grid-cols-1 gap-3 min-[1180px]:grid-cols-2">
          <Input label="Cliente" value={item.client || ""} onChange={(v) => updateField("client", v)} />
          <Input label="Ano" value={item.year || ""} onChange={(v) => updateField("year", v)} />
        </div>
        <Input label="Servicos" value={item.services || ""} onChange={(v) => updateField("services", v)} placeholder="UI Design, Frontend" />
        <Input label="Link externo" value={item.link} onChange={(v) => updateField("link", v)} placeholder="https://..." />
        <RichTextField
          label="Descricao"
          value={item.description || ""}
          onChange={(v) => updateField("description", v)}
          placeholder="Resumo do case"
          multiline
        />
        <div className="space-y-2">
          <label className="block text-[#777]" style={{ fontSize: "11px", lineHeight: "16.5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Espacamento apos divisor das informacoes
          </label>
          <div
            className="rounded-[12px] border px-3 py-3"
            style={{ backgroundColor: "#141414", borderColor: "#1e1e1e" }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#888]" style={{ fontSize: "12px", lineHeight: "18px" }}>
                Distancia entre o divisor dos metadados e a proxima secao do case.
              </span>
              <span className="rounded-full px-2 py-0.5 text-[#fafafa]" style={{ fontSize: "11px", lineHeight: "16px", backgroundColor: "#1c1c1c" }}>
                {item.infoDividerSpacing ?? 48}px
              </span>
            </div>
            <input
              type="range"
              min={24}
              max={160}
              step={4}
              value={item.infoDividerSpacing ?? 48}
              onChange={(event) => updateField("infoDividerSpacing", Number(event.target.value))}
              className="mt-3 w-full accent-[#fafafa]"
            />
          </div>
        </div>
          </>
        ),
      },
      {
        key: "images",
        title: "Midia visual",
        defaultOpen: false,
        content: (
          <>
        <ImageUrlField
          label="Imagem do card"
          value={item.cardImage || ""}
          onChange={(value) => updateField("cardImage", value)}
          placeholder="Cole a URL ou envie a imagem usada no card"
        />
        {item.cardImage && supportsPositionEditor(item.cardImage) && (
          <ImagePositionEditor
            src={item.cardImage}
            position={item.cardImagePosition || item.imagePosition || "50% 50%"}
            onChange={(pos) => updateField("cardImagePosition", pos)}
            height={300}
            label="Reposicionar imagem do card"
          />
        )}
        {item.cardImage && !supportsPositionEditor(item.cardImage) && (
          <p className="text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
            Este formato usa enquadramento automatico para preservar nitidez e performance. O reposicionamento manual continua disponivel apenas para imagens.
          </p>
        )}
        <ImageUrlField
          label="Imagem principal da pagina"
          value={item.image}
          onChange={(value) => updateField("image", value)}
          placeholder="Cole a URL ou envie WebM, Lottie, SVG, WebP..."
          galleryImages={item.galleryImages || []}
          onGalleryImagesChange={(imgs) => updateField("galleryImages", imgs)}
          galleryPositions={item.galleryPositions || []}
          onGalleryPositionsChange={(positions) => updateField("galleryPositions", positions)}
        />
        {item.image && supportsPositionEditor(item.image) && (
          <ImagePositionEditor
            src={item.image}
            position={item.imagePosition || "50% 50%"}
            onChange={(pos) => updateField("imagePosition", pos)}
            height={300}
            label="Reposicionar imagem principal da pagina (altura fixa 525px no site)"
          />
        )}
        {item.image && !supportsPositionEditor(item.image) && (
          <p className="text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
            Este formato usa enquadramento automatico para preservar nitidez e performance. O reposicionamento manual continua disponivel apenas para imagens.
          </p>
        )}
        <p className="text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
          A imagem do card aparece apenas na home e nas listagens. A imagem principal da pagina fica abaixo do titulo e subtitulo no detalhe do projeto.
        </p>
        <div className="space-y-1.5">
          <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Cor de fundo das imagens</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={item.imageBgColor || "#000000"}
              onChange={(e) => updateField("imageBgColor", e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-none p-0"
              style={{ backgroundColor: "transparent" }}
              disabled={!item.imageBgColor}
            />
            <SelectionProtectedInput
              type="text"
              value={item.imageBgColor || ""}
              onChange={(e) => updateField("imageBgColor", e.target.value)}
              placeholder="Sem fundo (padrao)"
              className="flex-1 rounded-lg px-3 py-2 text-[#fafafa] placeholder-[#444] focus:outline-none transition-colors"
              style={{ fontSize: "13px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
            />
            {item.imageBgColor && (
              <button
                type="button"
                onClick={() => updateField("imageBgColor", "")}
                className="px-2 py-1.5 rounded-lg cursor-pointer border-none text-[#999] hover:text-[#fafafa] transition-colors"
                style={{ fontSize: "12px", backgroundColor: "#1a1a1a" }}
              >
                Limpar
              </button>
            )}
          </div>
          <p className="text-[#555]" style={{ fontSize: "11px" }}>Deixe vazio para exibir apenas a imagem sem fundo colorido.</p>
        </div>
        <GalleryEditor
          images={item.galleryImages || []}
          onChange={(imgs) => updateField("galleryImages", imgs)}
          positions={item.galleryPositions || []}
          onPositionsChange={(positions) => updateField("galleryPositions", positions)}
        />
          </>
        ),
      },
      {
        key: "content",
        title: "Conteudo",
        content: (
          <>
        <BlockEditor blocks={item.contentBlocks || []} onChange={(blocks) => updateField("contentBlocks", blocks)} />
          </>
        ),
      },
      {
        key: "organization",
        title: "Organizacao",
        defaultOpen: false,
        content: (
          <>
        <div className="rounded-[12px] p-3" style={{ backgroundColor: "#0e0e0e", border: "1px solid #1a1a1a" }}>
          <label className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[#ddd]" style={{ fontSize: "13px", lineHeight: "19px" }}>
                Mostrar no site
              </p>
              <p className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16px" }}>
                Quando oculto, o projeto desaparece do site público, mas continua salvo aqui no CMS.
              </p>
            </div>
            <input
              type="checkbox"
              checked={isItemVisible}
              onChange={(event) => setItemVisible(event.target.checked)}
              className="mt-0.5 accent-[#fafafa]"
            />
          </label>
        </div>
        <TagsInput tags={item.tags || []} onChange={(tags) => updateField("tags", tags)} />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={item.featured || false}
            onChange={(e) => updateField("featured", e.target.checked)}
            className="accent-[#00ff3c]"
          />
          <label className="text-[#aaa]" style={{ fontSize: "13px" }}>Destacar projeto</label>
        </div>
          </>
        ),
      },
      {
        key: "protection",
        title: "Protecao por senha",
        defaultOpen: false,
        content: (
          <>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {item.password ? (
              <Lock size={14} className="text-[#ffa500]" />
            ) : (
              <LockOpen size={14} className="text-[#555]" />
            )}
            <span className="text-[#aaa]" style={{ fontSize: "13px" }}>
              {item.password ? "Projeto protegido por senha" : "Projeto aberto (sem senha)"}
            </span>
          </div>
          <div className="space-y-1.5">
            <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Senha de acesso</label>
            <div className="flex items-center gap-2">
              <SelectionProtectedInput
                type="text"
                value={item.password || ""}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="Deixe vazio para acesso livre"
                className="flex-1 rounded-lg px-3 py-2 text-[#fafafa] placeholder-[#444] focus:outline-none transition-colors"
                style={{ fontSize: "13px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
              />
              {item.password && (
                <button
                  type="button"
                  onClick={() => updateField("password", "")}
                  className="px-2.5 py-1.5 rounded-lg cursor-pointer border-none text-[#999] hover:text-red-400 transition-colors flex items-center gap-1"
                  style={{ fontSize: "12px", backgroundColor: "#1a1a1a" }}
                >
                  <X size={12} /> Remover
                </button>
              )}
            </div>
            <p className="text-[#555]" style={{ fontSize: "11px" }}>
              Visitantes precisarao digitar esta senha para ver o projeto. Ideal para cases sensiveis/NDA.
            </p>
            {item.password && (
              <Link
                to="/access-requests"
                className="inline-flex items-center gap-1.5 text-[#888] transition-colors hover:text-[#fafafa]"
                style={{ fontSize: "11px", lineHeight: "16px" }}
              >
                Ver e aprovar solicitações de acesso
              </Link>
            )}
          </div>
        </div>
          </>
        ),
      },
      {
        key: "seo",
        title: "SEO",
        defaultOpen: false,
        content: (
          <>
        <Input label="Titulo SEO" value={item.seoTitle || ""} onChange={(v) => updateField("seoTitle", v)} placeholder="Deixe vazio para usar o titulo" />
        <TextArea label="Descricao SEO" value={item.seoDescription || ""} onChange={(v) => updateField("seoDescription", v)} rows={2} placeholder="Descricao para mecanismos de busca" />
          </>
        ),
      },
    ])
  );

  // Form for articles
  const renderArticleForm = () => (
    renderSectionList([
      {
        key: "basics",
        title: "Informacoes basicas",
        content: (
          <>
        <RichTextField
          label="Titulo completo do artigo"
          value={item.title}
          onChange={(v) => updateField("title", v)}
          placeholder="Titulo maior da pagina interna"
          helperText="Clique no texto para abrir a mesma barra de estilo dos blocos de conteudo."
        />
        <RichTextField
          label="Subtitulo do artigo"
          value={item.subtitle || ""}
          onChange={(v) => updateField("subtitle", v)}
          placeholder="Texto abaixo do titulo da pagina"
          helperText="Aceita destaque, cor, tamanho inline e demais estilos do editor rico."
        />
        <div className="space-y-4">
          <TextAppearanceControl
            label="Aparencia do titulo da pagina"
            value={item.titleAppearance}
            onChange={(value) => updateField("titleAppearance", value)}
            defaults={ARTICLE_TITLE_APPEARANCE_DEFAULTS}
            defaultColorValue="#FAFAFA"
            sample={richTextToPlainText(item.title) || "Titulo do artigo"}
            fontSizeRange={{ min: 20, max: 72 }}
            responsiveLimits={DETAIL_PAGE_TITLE_RESPONSIVE_LIMITS}
          />
          <TextAppearanceControl
            label="Aparencia do subtitulo da pagina"
            value={item.subtitleAppearance}
            onChange={(value) => updateField("subtitleAppearance", value)}
            defaults={ARTICLE_SUBTITLE_APPEARANCE_DEFAULTS}
            defaultColorValue="#ABABAB"
            sample={richTextToPlainText(item.subtitle) || "Subtitulo do artigo"}
            fontSizeRange={{ min: 14, max: 40 }}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 min-[1180px]:grid-cols-2">
          <RichTextField
            label="Titulo do card"
            value={item.cardTitle || ""}
            onChange={(v) => updateField("cardTitle", v)}
            placeholder="Versao curta para home e listagem"
          />
          <RichTextField
            label="Subtitulo do card (opcional)"
            value={item.cardSubtitle || ""}
            onChange={(v) => updateField("cardSubtitle", v)}
            placeholder="Se vazio, usa a descricao curta"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 min-[1180px]:grid-cols-2">
          <Input label="Slug (URL)" value={item.slug || ""} onChange={(v) => updateField("slug", slugify(v))} placeholder="meu-artigo" />
          <Input label="Publicacao" value={item.publisher || ""} onChange={(v) => updateField("publisher", v)} placeholder="Blog" />
        </div>
        <div className="grid grid-cols-1 gap-3 min-[1180px]:grid-cols-2">
          <Input label="Data" value={item.date} onChange={(v) => updateField("date", v)} />
          <Input label="Tempo de leitura" value={item.readTime || ""} onChange={(v) => updateField("readTime", v)} placeholder="5 min" />
        </div>
        <div className="grid grid-cols-1 gap-3 min-[1180px]:grid-cols-2">
          <Input label="Autor" value={item.author || ""} onChange={(v) => updateField("author", v)} />
          <Input label="Categoria" value={item.category || ""} onChange={(v) => updateField("category", v)} placeholder="Design, Tecnologia..." />
        </div>
        <Input label="Servicos / Topicos" value={item.services || ""} onChange={(v) => updateField("services", v)} placeholder="UX Research, UI Design..." />
        <Input label="Link externo" value={item.link || ""} onChange={(v) => updateField("link", v)} placeholder="https://..." />
        <RichTextField
          label="Descricao curta / resumo"
          value={item.description || ""}
          onChange={(v) => updateField("description", v)}
          placeholder="Resumo do artigo"
          multiline
        />
          </>
        ),
      },
      {
        key: "images",
        title: "Midia visual",
        defaultOpen: false,
        content: (
          <>
        <ImageUrlField
          label="Imagem do card"
          value={item.cardImage || ""}
          onChange={(value) => updateField("cardImage", value)}
          placeholder="Cole a URL ou envie a imagem usada no card"
        />
        {item.cardImage && supportsPositionEditor(item.cardImage) && (
          <ImagePositionEditor
            src={item.cardImage}
            position={item.cardImagePosition || item.imagePosition || "50% 50%"}
            onChange={(pos) => updateField("cardImagePosition", pos)}
            height={300}
            label="Reposicionar imagem do card"
          />
        )}
        {item.cardImage && !supportsPositionEditor(item.cardImage) && (
          <p className="text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
            Este formato usa enquadramento automatico para preservar nitidez e performance. O reposicionamento manual continua disponivel apenas para imagens.
          </p>
        )}
        <ImageUrlField
          label="Imagem principal da pagina"
          value={item.image || ""}
          onChange={(value) => updateField("image", value)}
          placeholder="Cole a URL ou envie WebM, Lottie, SVG, WebP..."
          galleryImages={item.galleryImages || []}
          onGalleryImagesChange={(imgs) => updateField("galleryImages", imgs)}
          galleryPositions={item.galleryPositions || []}
          onGalleryPositionsChange={(positions) => updateField("galleryPositions", positions)}
        />
        {item.image && supportsPositionEditor(item.image) && (
          <ImagePositionEditor
            src={item.image}
            position={item.imagePosition || "50% 50%"}
            onChange={(pos) => updateField("imagePosition", pos)}
            height={300}
            label="Reposicionar imagem principal da pagina (altura fixa 525px no site)"
          />
        )}
        {item.image && !supportsPositionEditor(item.image) && (
          <p className="text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
            Este formato usa enquadramento automatico para preservar nitidez e performance. O reposicionamento manual continua disponivel apenas para imagens.
          </p>
        )}
        <p className="text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
          A imagem do card aparece apenas na home e nas listagens. A imagem principal da pagina fica abaixo do titulo e subtitulo no detalhe do artigo.
        </p>
        <div className="space-y-1.5">
          <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Cor de fundo das imagens</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={item.imageBgColor || "#000000"}
              onChange={(e) => updateField("imageBgColor", e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-none p-0"
              style={{ backgroundColor: "transparent" }}
              disabled={!item.imageBgColor}
            />
            <SelectionProtectedInput
              type="text"
              value={item.imageBgColor || ""}
              onChange={(e) => updateField("imageBgColor", e.target.value)}
              placeholder="Sem fundo (padrao)"
              className="flex-1 rounded-lg px-3 py-2 text-[#fafafa] placeholder-[#444] focus:outline-none transition-colors"
              style={{ fontSize: "13px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
            />
            {item.imageBgColor && (
              <button
                type="button"
                onClick={() => updateField("imageBgColor", "")}
                className="px-2 py-1.5 rounded-lg cursor-pointer border-none text-[#999] hover:text-[#fafafa] transition-colors"
                style={{ fontSize: "12px", backgroundColor: "#1a1a1a" }}
              >
                Limpar
              </button>
            )}
          </div>
          <p className="text-[#555]" style={{ fontSize: "11px" }}>Deixe vazio para exibir apenas a imagem sem fundo colorido.</p>
        </div>
        <GalleryEditor
          images={item.galleryImages || []}
          onChange={(imgs) => updateField("galleryImages", imgs)}
          positions={item.galleryPositions || []}
          onPositionsChange={(positions) => updateField("galleryPositions", positions)}
        />
          </>
        ),
      },
      {
        key: "content",
        title: "Conteudo",
        content: (
          <>
        <BlockEditor blocks={item.contentBlocks || []} onChange={(blocks) => updateField("contentBlocks", blocks)} />
          </>
        ),
      },
      {
        key: "organization",
        title: "Organizacao",
        defaultOpen: false,
        content: (
          <>
        <div className="rounded-[12px] p-3" style={{ backgroundColor: "#0e0e0e", border: "1px solid #1a1a1a" }}>
          <label className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[#ddd]" style={{ fontSize: "13px", lineHeight: "19px" }}>
                Mostrar no site
              </p>
              <p className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16px" }}>
                Quando oculto, o artigo desaparece do site público, mas continua salvo aqui no CMS.
              </p>
            </div>
            <input
              type="checkbox"
              checked={isItemVisible}
              onChange={(event) => setItemVisible(event.target.checked)}
              className="mt-0.5 accent-[#fafafa]"
            />
          </label>
        </div>
        <TagsInput tags={item.tags || []} onChange={(tags) => updateField("tags", tags)} />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={item.featured || false}
            onChange={(e) => updateField("featured", e.target.checked)}
            className="accent-[#00ff3c]"
          />
          <label className="text-[#aaa]" style={{ fontSize: "13px" }}>Destacar artigo</label>
        </div>
          </>
        ),
      },
      {
        key: "protection",
        title: "Protecao por senha",
        defaultOpen: false,
        content: (
          <>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {item.password ? (
              <Lock size={14} className="text-[#ffa500]" />
            ) : (
              <LockOpen size={14} className="text-[#555]" />
            )}
            <span className="text-[#aaa]" style={{ fontSize: "13px" }}>
              {item.password ? "Artigo protegido por senha" : "Artigo aberto (sem senha)"}
            </span>
          </div>
          <div className="space-y-1.5">
            <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Senha de acesso</label>
            <div className="flex items-center gap-2">
              <SelectionProtectedInput
                type="text"
                value={item.password || ""}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="Deixe vazio para acesso livre"
                className="flex-1 rounded-lg px-3 py-2 text-[#fafafa] placeholder-[#444] focus:outline-none transition-colors"
                style={{ fontSize: "13px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
              />
              {item.password && (
                <button
                  type="button"
                  onClick={() => updateField("password", "")}
                  className="px-2.5 py-1.5 rounded-lg cursor-pointer border-none text-[#999] hover:text-red-400 transition-colors flex items-center gap-1"
                  style={{ fontSize: "12px", backgroundColor: "#1a1a1a" }}
                >
                  <X size={12} /> Remover
                </button>
              )}
            </div>
            <p className="text-[#555]" style={{ fontSize: "11px" }}>
              Visitantes precisarao digitar esta senha para ver o artigo. Ideal para conteudo exclusivo.
            </p>
          </div>
        </div>
          </>
        ),
      },
      {
        key: "seo",
        title: "SEO",
        defaultOpen: false,
        content: (
          <>
        <Input label="Titulo SEO" value={item.seoTitle || ""} onChange={(v) => updateField("seoTitle", v)} />
        <TextArea label="Descricao SEO" value={item.seoDescription || ""} onChange={(v) => updateField("seoDescription", v)} rows={2} />
          </>
        ),
      },
    ])
  );

  // Form for pages
  const renderPageForm = () => (
    renderSectionList([
      {
        key: "basics",
        title: "Informacoes basicas",
        content: (
          <>
        <Input label="Titulo" value={item.title} onChange={(v) => updateField("title", v)} placeholder="Titulo da pagina" />
        <Input label="Slug (URL)" value={item.slug || ""} onChange={(v) => updateField("slug", slugify(v))} placeholder="minha-pagina" />
        <TextArea label="Descricao" value={item.description || ""} onChange={(v) => updateField("description", v)} rows={3} />
          </>
        ),
      },
      {
        key: "content",
        title: "Conteudo",
        content: (
          <>
        <BlockEditor blocks={item.contentBlocks || []} onChange={(blocks) => updateField("contentBlocks", blocks)} />
          </>
        ),
      },
      {
        key: "seo",
        title: "SEO",
        defaultOpen: false,
        content: (
          <>
        <Input label="Titulo SEO" value={item.seoTitle || ""} onChange={(v) => updateField("seoTitle", v)} />
        <TextArea label="Descricao SEO" value={item.seoDescription || ""} onChange={(v) => updateField("seoDescription", v)} rows={2} />
          </>
        ),
      },
    ])
  );

  const renderForm = () => {
    if (contentType === "projects") return renderProjectForm();
    if (contentType === "articles") return renderArticleForm();
    return renderPageForm();
  };

  return (
    <div className="-mx-8 -my-8 flex min-h-[calc(100vh-64px)] flex-col">
      {/* Top action bar */}
      <div
        className="sticky top-0 z-20 flex min-h-14 flex-wrap items-center justify-between gap-3 border-b px-6 py-3"
        style={{ backgroundColor: "#0a0a0a", borderColor: "#1e1e1e" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={`/content/${contentType}`}
            className="text-[#666] hover:text-[#aaa] transition-colors flex items-center gap-1"
            style={{ fontSize: "13px" }}
          >
            <ArrowLeft size={14} />
          </Link>
          <div className="w-px h-5" style={{ backgroundColor: "#1e1e1e" }} />
          <span className="text-[#fafafa] truncate max-w-[200px]" style={{ fontSize: "14px" }}>
            {item.title || "Sem titulo"}
          </span>
          {hasChanges && (
            <span className="text-[#ffa500] shrink-0" style={{ fontSize: "11px" }}>
              Alteracoes nao salvas
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* Mode toggle */}
          <div className="hidden items-center gap-1 rounded-[10px] p-0.5 md:flex" style={{ backgroundColor: "#141414" }}>
            {modeButtons.map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`flex h-[24.5px] items-center gap-1.5 rounded-[8px] px-2.5 cursor-pointer transition-colors ${
                  mode === m.key ? "text-[#fafafa] bg-[#1e1e1e]" : "text-[#666] hover:text-[#aaa]"
                }`}
                style={{ fontSize: "11px", lineHeight: "16.5px" }}
                title={m.label}
              >
                <m.icon size={13} />
                <span className="hidden lg:inline">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Preview mode */}
          {(mode === "visual" || mode === "split") && (
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setPreviewMode("desktop")}
                className={`flex h-[26px] w-[26px] items-center justify-center rounded-[4px] cursor-pointer ${previewMode === "desktop" ? "text-[#fafafa]" : "text-[#555]"}`}
              >
                <Monitor size={14} />
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`flex h-[26px] w-[26px] items-center justify-center rounded-[4px] cursor-pointer ${previewMode === "mobile" ? "text-[#fafafa]" : "text-[#555]"}`}
              >
                <Smartphone size={14} />
              </button>
            </div>
          )}

          <div className="w-px h-5" style={{ backgroundColor: "#1e1e1e" }} />

          {/* Status */}
          <StatusSelector status={item.status || "draft"} onChange={(s) => updateField("status", s)} contentType={contentType} />

          {/* Save draft */}
          <button
            onClick={() => void saveItem()}
            className="flex h-8 items-center gap-1.5 rounded-[10px] px-3 cursor-pointer transition-colors text-[#ccc] hover:text-[#fafafa] hover:bg-[#1a1a1a]"
            style={{ fontSize: "12px", lineHeight: "18px", border: "1px solid #1e1e1e" }}
            title="Salvar (Ctrl+S)"
          >
            <Save size={13} /> Salvar
          </button>

          {/* Version History */}
          <button
            onClick={() => setShowHistory(true)}
            className="flex h-8 items-center gap-1.5 rounded-[10px] px-2.5 cursor-pointer transition-colors text-[#666] hover:text-[#fafafa] hover:bg-[#1a1a1a]"
            style={{ fontSize: "12px", lineHeight: "18px", border: "1px solid #1e1e1e" }}
            title="Historico de versoes (Ctrl+Shift+H)"
          >
            <History size={13} />
            <span className="hidden lg:inline">Historico</span>
          </button>

          {/* Publish */}
          {item.status !== "published" && (
            <button
              onClick={publish}
              className="flex h-[30px] items-center gap-1.5 rounded-[10px] px-3 cursor-pointer transition-colors text-[#111] hover:opacity-90"
              style={{ fontSize: "12px", lineHeight: "18px", backgroundColor: "#00ff3c" }}
            >
              <Send size={13} /> Publicar
            </button>
          )}
        </div>
      </div>

      {/* Editor content */}
      <div className="flex-1 px-6 pb-6 pt-7">
        {mode === "form" && (
          <div className="w-full pt-1">
            {renderForm()}
          </div>
        )}

        {mode === "visual" && (
          <div className="w-full min-w-0 pt-1">
            <VisualPreview item={item} contentType={contentType} onUpdate={updateField} previewMode={previewMode} />
          </div>
        )}

        {mode === "split" && (
          <div
            className="grid w-full gap-4 pt-1 min-[1320px]:grid-cols-[minmax(0,1.12fr)_minmax(0,0.98fr)]"
            style={{ minHeight: "calc(100vh - 160px)" }}
          >
            <div className="min-w-0 overflow-y-auto pr-1 pt-1 min-[1320px]:pr-2" style={{ maxHeight: "calc(100vh - 160px)" }}>
              {renderForm()}
            </div>
            <div className="min-w-0 w-full pt-1 min-[1320px]:max-h-[calc(100vh-160px)]">
              <VisualPreview item={item} contentType={contentType} onUpdate={updateField} previewMode={previewMode} readOnly />
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts bar */}
      <div
        className="hidden items-center justify-center gap-6 border-t px-4 py-2 md:flex"
        style={{ borderTop: "1px solid #141414", backgroundColor: "#0a0a0a" }}
      >
        {[
          { keys: "Ctrl+S", action: "Salvar" },
          { keys: "Ctrl+Z", action: "Desfazer" },
          { keys: "Ctrl+Shift+H", action: "Historico" },
        ].map((shortcut) => (
          <div key={shortcut.keys} className="flex items-center gap-1.5">
            <kbd
              className="inline-flex items-center px-1.5 py-0.5 rounded"
              style={{ fontSize: "10px", backgroundColor: "#1a1a1a", color: "#666", border: "1px solid #242424" }}
            >
              {shortcut.keys}
            </kbd>
            <span className="text-[#444]" style={{ fontSize: "10px" }}>{shortcut.action}</span>
          </div>
        ))}
      </div>

      {/* Version History Panel */}
      {showHistory && id && (
        <VersionHistoryPanel
          contentId={`${contentType}-${id}`}
          currentData={item}
          onRestore={handleRestoreVersion}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
