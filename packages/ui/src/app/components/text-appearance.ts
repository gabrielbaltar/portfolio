import type { CSSProperties } from "react";
import type { TextAppearance } from "@portfolio/core";

type TextAppearanceDefaults = Required<Pick<TextAppearance, "fontSize" | "lineHeight" | "fontWeight" | "color">>;
type ResponsiveTextAppearanceStyle = CSSProperties & {
  "--responsive-font-size": string;
  "--responsive-line-height": string;
  "--responsive-mobile-max-font-size": string;
  "--responsive-mobile-max-line-height": string;
};

export const PROJECT_TITLE_APPEARANCE_DEFAULTS: TextAppearanceDefaults = {
  fontSize: 28,
  lineHeight: 36,
  fontWeight: 500,
  color: "var(--text-primary, #EDEDED)",
};

export const PROJECT_SUBTITLE_APPEARANCE_DEFAULTS: TextAppearanceDefaults = {
  fontSize: 18,
  lineHeight: 26,
  fontWeight: 400,
  color: "var(--text-secondary, #A6A6A6)",
};

export const ARTICLE_TITLE_APPEARANCE_DEFAULTS: TextAppearanceDefaults = {
  fontSize: 26,
  lineHeight: 31.2,
  fontWeight: 500,
  color: "var(--text-primary, #fafafa)",
};

export const ARTICLE_SUBTITLE_APPEARANCE_DEFAULTS: TextAppearanceDefaults = {
  fontSize: 18,
  lineHeight: 26,
  fontWeight: 400,
  color: "var(--text-secondary, #ababab)",
};

export function resolveTextAppearanceStyle(
  appearance: TextAppearance | undefined,
  defaults: TextAppearanceDefaults,
): CSSProperties {
  return {
    fontSize: `${appearance?.fontSize ?? defaults.fontSize}px`,
    lineHeight: `${appearance?.lineHeight ?? defaults.lineHeight}px`,
    fontWeight: appearance?.fontWeight ?? defaults.fontWeight,
    color: appearance?.color || defaults.color,
  };
}

export function resolveResponsiveTextAppearanceStyle(
  appearance: TextAppearance | undefined,
  defaults: TextAppearanceDefaults,
  mobileLimits: { maxFontSize: number; maxLineHeight: number },
): ResponsiveTextAppearanceStyle {
  const fontSize = appearance?.fontSize ?? defaults.fontSize;
  const lineHeight = appearance?.lineHeight ?? defaults.lineHeight;

  return {
    "--responsive-font-size": `${fontSize}px`,
    "--responsive-line-height": `${lineHeight}px`,
    "--responsive-mobile-max-font-size": `${Math.min(fontSize, mobileLimits.maxFontSize)}px`,
    "--responsive-mobile-max-line-height": `${Math.min(lineHeight, mobileLimits.maxLineHeight)}px`,
    fontSize: "var(--responsive-font-size)",
    lineHeight: "var(--responsive-line-height)",
    fontWeight: appearance?.fontWeight ?? defaults.fontWeight,
    color: appearance?.color || defaults.color,
  };
}
