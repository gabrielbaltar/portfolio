import type { CSSProperties } from "react";
import type { TextAppearance } from "@portfolio/core";

export type TextAppearanceDefaults = Required<Pick<TextAppearance, "fontSize" | "lineHeight" | "fontWeight" | "color">>;
export type ResponsiveTextAppearanceLimits = {
  tablet: { maxFontSize: number; maxLineHeight: number };
  mobile: { maxFontSize: number; maxLineHeight: number };
};

type ResponsiveTextAppearanceValues = {
  baseFontSize: number;
  baseLineHeight: number;
  tabletDefault: { fontSize: number; lineHeight: number };
  tablet: { fontSize: number; lineHeight: number };
  mobileDefault: { fontSize: number; lineHeight: number };
  mobile: { fontSize: number; lineHeight: number };
};

type ResponsiveTextAppearanceStyle = CSSProperties & {
  "--responsive-font-size": string;
  "--responsive-line-height": string;
  "--responsive-tablet-font-size": string;
  "--responsive-tablet-line-height": string;
  "--responsive-mobile-font-size": string;
  "--responsive-mobile-line-height": string;
};

export const DETAIL_PAGE_TITLE_RESPONSIVE_LIMITS: ResponsiveTextAppearanceLimits = {
  tablet: {
    maxFontSize: 24,
    maxLineHeight: 30,
  },
  mobile: {
    maxFontSize: 22,
    maxLineHeight: 28,
  },
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

export function getResponsiveTextAppearanceValues(
  appearance: TextAppearance | undefined,
  defaults: TextAppearanceDefaults,
  responsiveLimits: ResponsiveTextAppearanceLimits,
): ResponsiveTextAppearanceValues {
  const baseFontSize = appearance?.fontSize ?? defaults.fontSize;
  const baseLineHeight = appearance?.lineHeight ?? defaults.lineHeight;
  const tabletDefault = {
    fontSize: Math.min(baseFontSize, responsiveLimits.tablet.maxFontSize),
    lineHeight: Math.min(baseLineHeight, responsiveLimits.tablet.maxLineHeight),
  };
  const tablet = {
    fontSize: appearance?.tablet?.fontSize ?? tabletDefault.fontSize,
    lineHeight: appearance?.tablet?.lineHeight ?? tabletDefault.lineHeight,
  };
  const mobileDefault = {
    fontSize: Math.min(tablet.fontSize, responsiveLimits.mobile.maxFontSize),
    lineHeight: Math.min(tablet.lineHeight, responsiveLimits.mobile.maxLineHeight),
  };

  return {
    baseFontSize,
    baseLineHeight,
    tabletDefault,
    tablet,
    mobileDefault,
    mobile: {
      fontSize: appearance?.mobile?.fontSize ?? mobileDefault.fontSize,
      lineHeight: appearance?.mobile?.lineHeight ?? mobileDefault.lineHeight,
    },
  };
}

export function resolveResponsiveTextAppearanceStyle(
  appearance: TextAppearance | undefined,
  defaults: TextAppearanceDefaults,
  responsiveLimits: ResponsiveTextAppearanceLimits,
): ResponsiveTextAppearanceStyle {
  const values = getResponsiveTextAppearanceValues(appearance, defaults, responsiveLimits);

  return {
    "--responsive-font-size": `${values.baseFontSize}px`,
    "--responsive-line-height": `${values.baseLineHeight}px`,
    "--responsive-tablet-font-size": `${values.tablet.fontSize}px`,
    "--responsive-tablet-line-height": `${values.tablet.lineHeight}px`,
    "--responsive-mobile-font-size": `${values.mobile.fontSize}px`,
    "--responsive-mobile-line-height": `${values.mobile.lineHeight}px`,
    fontWeight: appearance?.fontWeight ?? defaults.fontWeight,
    color: appearance?.color || defaults.color,
  };
}
