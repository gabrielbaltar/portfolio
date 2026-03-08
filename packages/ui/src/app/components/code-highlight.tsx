import type { CSSProperties } from "react";
import Editor from "react-simple-code-editor";
import { Highlight, type PrismTheme } from "prism-react-renderer";
import { useTheme } from "./theme-context";

type CodeHighlightVariant = "public" | "editor";

type CodeHighlightProps = {
  code: string;
  language?: string;
  variant?: CodeHighlightVariant;
  editable?: boolean;
  onChange?: (value: string) => void;
  minHeight?: number;
  maxHeight?: number;
  placeholder?: string;
};

const CODE_FONT_FAMILY = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace";
const CODE_FONT_SIZE = 13;
const CODE_LINE_HEIGHT = 21;
const CODE_PADDING = 16;
const EMPTY_CODE_FALLBACK = "// codigo vazio";

const PRISM_LANGUAGE_MAP: Record<string, string> = {
  plaintext: "plaintext",
  typescript: "typescript",
  tsx: "tsx",
  javascript: "javascript",
  jsx: "jsx",
  html: "html",
  css: "css",
  json: "json",
  bash: "plaintext",
  sql: "sql",
  python: "python",
  markdown: "markdown",
};

function resolvePrismLanguage(language?: string) {
  if (!language) return "plaintext";
  return PRISM_LANGUAGE_MAP[language] || "plaintext";
}

function isTerminalLikeLanguage(language?: string) {
  return !language || language === "plaintext" || language === "bash";
}

const EDITOR_CODE_THEME: PrismTheme = {
  plain: {
    color: "#d8e3f0",
    backgroundColor: "#0b1220",
  },
  styles: [
    { types: ["comment", "prolog", "doctype", "cdata"], style: { color: "#5f7a99", fontStyle: "italic" } },
    { types: ["punctuation", "operator"], style: { color: "#93a4bf" } },
    { types: ["namespace"], style: { color: "#9fb7d4" } },
    { types: ["tag", "keyword", "selector", "important"], style: { color: "#7dd3fc", fontWeight: "600" } },
    { types: ["property", "attr-name", "regex", "entity"], style: { color: "#f0abfc" } },
    { types: ["boolean", "number", "constant", "symbol"], style: { color: "#f59e0b" } },
    { types: ["string", "char", "attr-value", "builtin", "inserted"], style: { color: "#86efac" } },
    { types: ["function", "class-name"], style: { color: "#c4b5fd" } },
    { types: ["variable"], style: { color: "#f8fafc" } },
    { types: ["url"], style: { color: "#fda4af", textDecorationLine: "underline" } },
    { types: ["deleted"], style: { color: "#fca5a5" } },
    { types: ["bold"], style: { fontWeight: "700" } },
    { types: ["italic"], style: { fontStyle: "italic" } },
  ],
};

const PORTFOLIO_CODE_THEME: PrismTheme = {
  plain: {
    color: "#f3f4f6",
    backgroundColor: "var(--bg-secondary, #0F1012)",
  },
  styles: [
    { types: ["comment", "prolog", "doctype", "cdata"], style: { color: "#5e6778", fontStyle: "italic" } },
    { types: ["punctuation"], style: { color: "#a9b4c4" } },
    { types: ["operator"], style: { color: "#ffe55c" } },
    { types: ["keyword", "tag", "selector", "important"], style: { color: "#7ee0d6", fontWeight: "600" } },
    { types: ["function"], style: { color: "#f7be7a" } },
    { types: ["class-name", "builtin", "property", "attr-name"], style: { color: "#b6a1ff" } },
    { types: ["boolean", "number", "constant", "symbol"], style: { color: "#3da9fc" } },
    { types: ["string", "char", "attr-value", "inserted"], style: { color: "#f5a6df" } },
    { types: ["regex", "entity", "url"], style: { color: "#86e1da" } },
    { types: ["variable", "namespace"], style: { color: "#f3f4f6" } },
    { types: ["deleted"], style: { color: "#ff9b99" } },
    { types: ["bold"], style: { fontWeight: "700" } },
    { types: ["italic"], style: { fontStyle: "italic" } },
  ],
};

const TERMINAL_PUBLIC_THEME: PrismTheme = {
  plain: {
    color: "#dde3d8",
    backgroundColor: "var(--bg-secondary, #0F1012)",
  },
  styles: [
    { types: ["comment", "prolog", "doctype", "cdata"], style: { color: "#73786f", fontStyle: "italic" } },
    { types: ["punctuation", "operator", "keyword", "string", "number", "function", "boolean", "builtin", "class-name", "tag", "selector", "attr-name", "attr-value", "property", "symbol", "regex", "important", "inserted", "deleted", "variable", "namespace"], style: { color: "#dde3d8" } },
    { types: ["bold"], style: { fontWeight: "700" } },
    { types: ["italic"], style: { fontStyle: "italic" } },
  ],
};

const TERMINAL_DARK_THEME: PrismTheme = {
  plain: {
    color: "#dde3d8",
    backgroundColor: "#111315",
  },
  styles: [
    { types: ["comment", "prolog", "doctype", "cdata"], style: { color: "#73786f", fontStyle: "italic" } },
    { types: ["punctuation", "operator", "keyword", "string", "number", "function", "boolean", "builtin", "class-name", "tag", "selector", "attr-name", "attr-value", "property", "symbol", "regex", "important", "inserted", "deleted", "variable", "namespace"], style: { color: "#dde3d8" } },
    { types: ["bold"], style: { fontWeight: "700" } },
    { types: ["italic"], style: { fontStyle: "italic" } },
  ],
};

function getCodeTheme(theme: "dark" | "light", variant: CodeHighlightVariant, language?: string) {
  if (variant === "editor") {
    return isTerminalLikeLanguage(language) ? TERMINAL_DARK_THEME : EDITOR_CODE_THEME;
  }

  if (isTerminalLikeLanguage(language)) {
    return TERMINAL_PUBLIC_THEME;
  }

  return PORTFOLIO_CODE_THEME;
}

function getScrollbarStyles(theme: "dark" | "light", variant: CodeHighlightVariant, backgroundColor: string): CSSProperties {
  const thumbColor = variant === "editor"
    ? (theme === "light" ? "rgba(36, 45, 62, 0.28)" : "rgba(152, 180, 214, 0.28)")
    : "rgba(255, 255, 255, 0.18)";

  return {
    "--code-scroll-track": backgroundColor,
    "--code-scroll-thumb": thumbColor,
    scrollbarColor: `${thumbColor} ${backgroundColor}`,
  } as CSSProperties;
}

function HighlightedCode({
  code,
  language,
  variant = "public",
  dimmed = false,
}: {
  code: string;
  language?: string;
  variant?: CodeHighlightVariant;
  dimmed?: boolean;
}) {
  const { theme } = useTheme();
  const prismTheme = getCodeTheme(theme, variant, language);

  return (
    <Highlight
      code={code}
      language={resolvePrismLanguage(language)}
      theme={prismTheme}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={className}
          style={{
            ...style,
            margin: 0,
            backgroundColor: "transparent",
            color: prismTheme.plain.color || style.color,
            fontFamily: CODE_FONT_FAMILY,
            fontSize: `${CODE_FONT_SIZE}px`,
            lineHeight: `${CODE_LINE_HEIGHT}px`,
            whiteSpace: "pre",
            minWidth: "max-content",
          }}
        >
          {tokens.map((line, lineIndex) => {
            const lineProps = getLineProps({ line });
            const isEmptyLine = line.length === 1 && line[0]?.empty;

            return (
              <div
                key={lineIndex}
                {...lineProps}
                style={{
                  ...lineProps.style,
                  minHeight: `${CODE_LINE_HEIGHT}px`,
                  opacity: dimmed ? 0.5 : 1,
                }}
              >
                {isEmptyLine ? " " : null}
                {line.map((token, tokenIndex) => {
                  const tokenProps = getTokenProps({ token });

                  return (
                    <span
                      key={tokenIndex}
                      {...tokenProps}
                      style={{
                        ...tokenProps.style,
                        color: tokenProps.style?.color || prismTheme.plain.color,
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </pre>
      )}
    </Highlight>
  );
}

export function CodeHighlight({
  code,
  language,
  variant = "public",
  editable = false,
  onChange,
  minHeight = 0,
  maxHeight,
  placeholder = EMPTY_CODE_FALLBACK,
}: CodeHighlightProps) {
  const { theme } = useTheme();
  const prismTheme = getCodeTheme(theme, variant, language);
  const backgroundColor = prismTheme.plain.backgroundColor || (theme === "light" ? "#ffffff" : "#1E1E1E");
  const color = prismTheme.plain.color || (theme === "light" ? "#111111" : "#D4D4D4");
  const scrollbarStyles = getScrollbarStyles(theme, variant, backgroundColor);

  if (editable) {
    return (
      <Editor
        value={code}
        onValueChange={(nextValue) => onChange?.(nextValue)}
        highlight={(nextValue) => (
          <HighlightedCode
            code={nextValue || placeholder}
            language={language}
            variant={variant}
            dimmed={!nextValue}
          />
        )}
        padding={CODE_PADDING}
        placeholder={placeholder}
        textareaClassName="focus:outline-none"
        preClassName="overflow-x-auto"
        className="code-highlight-scroll w-full overflow-auto"
        style={{
          ...scrollbarStyles,
          minHeight: `${minHeight}px`,
          backgroundColor,
          color,
          fontFamily: CODE_FONT_FAMILY,
          fontSize: `${CODE_FONT_SIZE}px`,
          lineHeight: `${CODE_LINE_HEIGHT}px`,
          whiteSpace: "pre",
          overflow: "auto",
        }}
      />
    );
  }

  return (
    <div
      className="code-highlight-scroll overflow-auto p-4"
      style={{
        ...scrollbarStyles,
        maxHeight: maxHeight ? `${maxHeight}px` : undefined,
        backgroundColor,
      }}
    >
      <HighlightedCode
        code={code || placeholder}
        language={language}
        variant={variant}
        dimmed={!code}
      />
    </div>
  );
}
