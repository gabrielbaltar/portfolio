import { type ContentBlock } from "./cms-data";
import { RichTextContent, richTextToPlainText } from "./rich-text";

type ShowcaseVariant = "public" | "preview";
type ShowcaseBlock = Extract<
  ContentBlock,
  { type: "style-guide" | "color-palette" | "typography" | "icon-grid" | "user-flow" | "sitemap" }
>;

function getTheme(variant: ShowcaseVariant) {
  if (variant === "preview") {
    return {
      surface: "#111111",
      surfaceAlt: "#161616",
      border: "#242424",
      textPrimary: "#f5f5f5",
      textSecondary: "#9a9a9a",
      textMuted: "#666666",
      accent: "#38bdf8",
      accentAlt: "#14b8a6",
    };
  }

  return {
    surface: "var(--bg-secondary, #0F1012)",
    surfaceAlt: "rgba(255,255,255,0.03)",
    border: "var(--border-primary, #2A2A2A)",
    textPrimary: "var(--text-primary, #fafafa)",
    textSecondary: "var(--text-secondary, #a6a6a6)",
    textMuted: "var(--text-secondary, #6f6f6f)",
    accent: "var(--accent-blue, #38bdf8)",
    accentAlt: "var(--accent-green, #14b8a6)",
  };
}

function renderCardTitle(value: string, size: string, color: string) {
  return (
    <h3 className="font-['Inter',sans-serif]" style={{ fontSize: size, lineHeight: "1.18", color }}>
      <RichTextContent value={value} />
    </h3>
  );
}

function emptyMessage(message: string, color: string) {
  return (
    <div
      className="rounded-xl border border-dashed px-4 py-5 text-center"
      style={{ borderColor: color, color, opacity: 0.7 }}
    >
      <span style={{ fontSize: "13px", lineHeight: "20px" }}>{message}</span>
    </div>
  );
}

function getShowcaseBubbleStyles(theme: ReturnType<typeof getTheme>, variant: ShowcaseVariant) {
  return {
    backgroundColor: theme.textPrimary,
    color: variant === "preview" ? theme.surface : "var(--bg-primary, #111111)",
  };
}

function getShowcaseTagStyles(theme: ReturnType<typeof getTheme>) {
  return {
    backgroundColor: theme.surfaceAlt,
    color: theme.textSecondary,
    fontSize: "11px",
    lineHeight: "16px",
  } as const;
}

function renderTokenPill(token: string | undefined, theme: ReturnType<typeof getTheme>) {
  if (!token) return null;
  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5"
      style={{
        backgroundColor: theme.surfaceAlt,
        color: theme.textMuted,
        fontSize: "11px",
        lineHeight: "16px",
        border: `1px solid ${theme.border}`,
      }}
    >
      {token}
    </span>
  );
}

function renderMetaPill(label: string, value: string | undefined, theme: ReturnType<typeof getTheme>) {
  if (!value) return null;
  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5"
      style={{
        backgroundColor: theme.surfaceAlt,
        color: theme.textSecondary,
        fontSize: "11px",
        lineHeight: "16px",
        border: `1px solid ${theme.border}`,
      }}
    >
      <span style={{ color: theme.textMuted }}>{label}</span>
      <span className="ml-1" style={{ color: theme.textSecondary }}>{value}</span>
    </span>
  );
}

function parseFontSizeToPx(value: string | undefined) {
  if (!value) return 28;
  const normalized = value.trim().toLowerCase();
  const numeric = Number.parseFloat(normalized);
  if (Number.isNaN(numeric)) return 28;
  if (normalized.endsWith("rem") || normalized.endsWith("em")) return numeric * 16;
  return numeric;
}

function getTypographySampleMinHeight(value: string | undefined) {
  const px = parseFontSizeToPx(value);
  return `${Math.max(128, Math.min(260, Math.round(px * 2 + 80)))}px`;
}

function StyleGuideBlockView({
  block,
  variant,
}: {
  block: Extract<ContentBlock, { type: "style-guide" }>;
  variant: ShowcaseVariant;
}) {
  const theme = getTheme(variant);
  const bubbleStyles = getShowcaseBubbleStyles(theme, variant);

  return (
    <section
      className="rounded-2xl border p-5"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="max-w-[580px]">
          {renderCardTitle(block.title || "Style guide", "24px", theme.textPrimary)}
          {block.summary && (
            <p className="mt-3" style={{ fontSize: "15px", lineHeight: "24px", color: theme.textSecondary }}>
              <RichTextContent value={block.summary} />
            </p>
          )}
        </div>
        <div
          className="rounded-xl px-3 py-2"
          style={{ backgroundColor: theme.surfaceAlt, border: `1px solid ${theme.border}` }}
        >
          <span style={{ fontSize: "11px", lineHeight: "16px", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Direcao visual
          </span>
        </div>
      </div>

      {block.principles.length > 0 ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {block.principles.map((principle, index) => (
            <div
              key={`${principle.title}-${index}`}
              className="rounded-xl p-4"
              style={{ backgroundColor: theme.surfaceAlt, border: `1px solid ${theme.border}` }}
            >
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="flex h-8 w-8 min-h-8 min-w-8 max-h-8 max-w-8 shrink-0 items-center justify-center rounded-full"
                  style={{
                    ...bubbleStyles,
                    fontSize: "12px",
                    fontWeight: 700,
                    lineHeight: 1,
                    aspectRatio: "1 / 1",
                  }}
                >
                  {index + 1}
                </span>
                <span style={{ fontSize: "15px", lineHeight: "22px", color: theme.textPrimary }}>
                  {principle.title || `Principio ${index + 1}`}
                </span>
              </div>
              {principle.description && (
                <p style={{ fontSize: "14px", lineHeight: "22px", color: theme.textSecondary }}>
                  {principle.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5">{emptyMessage("Adicione principios visuais para este style guide.", theme.textMuted)}</div>
      )}
    </section>
  );
}

function ColorPaletteBlockView({
  block,
  variant,
}: {
  block: Extract<ContentBlock, { type: "color-palette" }>;
  variant: ShowcaseVariant;
}) {
  const theme = getTheme(variant);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          {renderCardTitle(block.title || "Paleta de cores", "24px", theme.textPrimary)}
        </div>
      </div>
      {block.colors.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {block.colors.map((color, index) => (
            <div
              key={`${color.name}-${color.hex}-${index}`}
              className="overflow-hidden rounded-2xl border"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              <div
                className="h-28 w-full"
                style={{ backgroundColor: color.hex || "#111111" }}
              />
              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block" style={{ fontSize: "15px", lineHeight: "22px", color: theme.textPrimary }}>
                      {color.name || `Cor ${index + 1}`}
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", lineHeight: "18px", color: theme.textMuted }}>
                    {(color.hex || "#000000").toUpperCase()}
                  </span>
                </div>
                {(color.token || color.role) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {renderTokenPill(color.token, theme)}
                    {color.role && (
                      <span
                        className="inline-flex rounded-full px-2 py-0.5"
                        style={{ backgroundColor: theme.surfaceAlt, color: theme.textSecondary, fontSize: "11px", lineHeight: "16px" }}
                      >
                        {color.role}
                      </span>
                    )}
                  </div>
                )}
                {color.usage && (
                  <p style={{ fontSize: "13px", lineHeight: "20px", color: theme.textSecondary }}>
                    {color.usage}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        emptyMessage("Adicione cores para montar a paleta do projeto.", theme.textMuted)
      )}
    </section>
  );
}

function TypographyBlockView({
  block,
  variant,
}: {
  block: Extract<ContentBlock, { type: "typography" }>;
  variant: ShowcaseVariant;
}) {
  const theme = getTheme(variant);

  return (
    <section>
      <div className="mb-4">{renderCardTitle(block.title || "Tipografia", "24px", theme.textPrimary)}</div>
      {block.fonts.length > 0 ? (
        <div className="space-y-3">
          {block.fonts.map((font, index) => (
            <div
              key={`${font.label}-${font.family}-${index}`}
              className="overflow-hidden rounded-2xl border"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              <div
                className="flex flex-col gap-3 px-4 py-4 md:px-5 md:py-5"
                style={{ backgroundColor: theme.surface }}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span style={{ fontSize: "16px", lineHeight: "22px", color: theme.textPrimary }}>
                      {font.label || `Fonte ${index + 1}`}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  {renderTokenPill(font.token, theme)}
                  {renderMetaPill("Fonte", font.family || "Font family", theme)}
                  {renderMetaPill("Peso", font.weight, theme)}
                  {renderMetaPill("Tamanho", font.size, theme)}
                  {renderMetaPill("Line-height", font.lineHeight, theme)}
                </div>
              </div>
              <div
                className="border-t px-4 py-5 md:px-5 md:py-6"
                style={{ backgroundColor: theme.surfaceAlt, borderColor: theme.border }}
              >
                <div className="flex flex-col justify-between gap-6" style={{ minHeight: getTypographySampleMinHeight(font.size) }}>
                  <p
                    className="w-full min-w-0"
                    style={{
                      color: theme.textPrimary,
                      fontFamily: font.family || undefined,
                      fontWeight: Number(font.weight) || font.weight || 600,
                      fontSize: font.size || "28px",
                      lineHeight: font.lineHeight || "1.2",
                      maxWidth: "100%",
                      wordBreak: "break-word",
                    }}
                  >
                    {font.sample || "Aa Bb Cc 123"}
                  </p>
                  <div
                    className="flex w-full flex-wrap items-center gap-x-4 gap-y-2"
                    style={{ fontSize: "12px", lineHeight: "18px", color: theme.textMuted }}
                  >
                    <span className="shrink-0">{font.size || "28px"}</span>
                    <span>ABCDEFGHIJKLMNOPQRSTUVWXYZ</span>
                    <span>0123456789</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        emptyMessage("Adicione estilos tipograficos para mostrar a hierarquia do projeto.", theme.textMuted)
      )}
    </section>
  );
}

function IconGridBlockView({
  block,
  variant,
}: {
  block: Extract<ContentBlock, { type: "icon-grid" }>;
  variant: ShowcaseVariant;
}) {
  const theme = getTheme(variant);

  return (
    <section>
      <div className="mb-4">{renderCardTitle(block.title || "Iconografia", "24px", theme.textPrimary)}</div>
      {block.icons.length > 0 ? (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {block.icons.map((icon, index) => (
            <div
              key={`${icon.name}-${icon.url}-${index}`}
              className="rounded-2xl border p-4 text-center"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: theme.surfaceAlt, border: `1px solid ${theme.border}` }}
              >
                {icon.url ? (
                  <img
                    src={icon.url}
                    alt={icon.name || `Icone ${index + 1}`}
                    className="max-h-10 max-w-10 object-contain"
                  />
                ) : (
                  <span style={{ fontSize: "14px", lineHeight: "20px", color: theme.textMuted }}>
                    {icon.name?.slice(0, 2).toUpperCase() || "IC"}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <div className="flex flex-col items-center gap-2">
                  <p style={{ fontSize: "14px", lineHeight: "21px", color: theme.textPrimary }}>
                    {icon.name || `Icone ${index + 1}`}
                  </p>
                  {renderTokenPill(icon.token, theme)}
                </div>
                {icon.notes && (
                  <p className="mt-2" style={{ fontSize: "12px", lineHeight: "18px", color: theme.textSecondary }}>
                    {icon.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        emptyMessage("Adicione os icones usados neste projeto para documentar o sistema visual.", theme.textMuted)
      )}
    </section>
  );
}

function UserFlowBlockView({
  block,
  variant,
}: {
  block: Extract<ContentBlock, { type: "user-flow" }>;
  variant: ShowcaseVariant;
}) {
  const theme = getTheme(variant);
  const bubbleStyles = getShowcaseBubbleStyles(theme, variant);
  const tagStyles = getShowcaseTagStyles(theme);

  return (
    <section>
      <div className="mb-4">{renderCardTitle(block.title || "Fluxo do usuario", "24px", theme.textPrimary)}</div>
      {block.steps.length > 0 ? (
        <div className="space-y-3">
          {block.steps.map((step, index) => (
            <div key={`${step.title}-${index}`} className="flex gap-3">
              <div className="flex w-8 shrink-0 flex-col items-center">
                <span
                  className="flex h-8 w-8 min-h-8 min-w-8 max-h-8 max-w-8 shrink-0 items-center justify-center rounded-full"
                  style={{
                    ...bubbleStyles,
                    fontSize: "12px",
                    fontWeight: 700,
                    lineHeight: 1,
                    aspectRatio: "1 / 1",
                  }}
                >
                  {index + 1}
                </span>
                {index < block.steps.length - 1 && (
                  <span className="mt-2 h-full w-px" style={{ backgroundColor: theme.border }} />
                )}
              </div>
              <div
                className="flex-1 rounded-2xl border p-4"
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              >
                <p style={{ fontSize: "15px", lineHeight: "22px", color: theme.textPrimary }}>
                  {step.title || `Etapa ${index + 1}`}
                </p>
                {step.description && (
                  <p className="mt-2" style={{ fontSize: "13px", lineHeight: "20px", color: theme.textSecondary }}>
                    {step.description}
                  </p>
                )}
                {step.outcome && (
                  <div className="mt-3">
                    <span
                      className="inline-flex rounded-full px-2 py-0.5"
                      style={tagStyles}
                    >
                      {step.outcome}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        emptyMessage("Adicione as etapas da jornada para mapear o fluxo do usuario.", theme.textMuted)
      )}
    </section>
  );
}

function SitemapBlockView({
  block,
  variant,
}: {
  block: Extract<ContentBlock, { type: "sitemap" }>;
  variant: ShowcaseVariant;
}) {
  const theme = getTheme(variant);
  const bulletStyles = getShowcaseBubbleStyles(theme, variant);

  return (
    <section>
      <div className="mb-4">{renderCardTitle(block.title || "Sitemap", "24px", theme.textPrimary)}</div>
      {block.sections.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {block.sections.map((section, index) => (
            <div
              key={`${section.title}-${index}`}
              className="rounded-2xl border p-4"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              <p style={{ fontSize: "15px", lineHeight: "22px", color: theme.textPrimary }}>
                {section.title || `Secao ${index + 1}`}
              </p>
              {section.description && (
                <p className="mt-2" style={{ fontSize: "13px", lineHeight: "20px", color: theme.textSecondary }}>
                  {section.description}
                </p>
              )}
              {section.children.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {section.children.map((child, childIndex) => (
                    <li
                      key={`${child}-${childIndex}`}
                      className="flex items-start gap-2"
                      style={{ fontSize: "13px", lineHeight: "20px", color: theme.textSecondary }}
                    >
                      <span
                        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: bulletStyles.backgroundColor }}
                      />
                      <span>{child}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        emptyMessage("Adicione secoes e paginas para estruturar o sitemap do case.", theme.textMuted)
      )}
    </section>
  );
}

export function isShowcaseBlock(block: ContentBlock): block is ShowcaseBlock {
  return [
    "style-guide",
    "color-palette",
    "typography",
    "icon-grid",
    "user-flow",
    "sitemap",
  ].includes(block.type);
}

export function ShowcaseBlockView({
  block,
  variant = "public",
}: {
  block: ShowcaseBlock;
  variant?: ShowcaseVariant;
}) {
  switch (block.type) {
    case "style-guide":
      return <StyleGuideBlockView block={block} variant={variant} />;
    case "color-palette":
      return <ColorPaletteBlockView block={block} variant={variant} />;
    case "typography":
      return <TypographyBlockView block={block} variant={variant} />;
    case "icon-grid":
      return <IconGridBlockView block={block} variant={variant} />;
    case "user-flow":
      return <UserFlowBlockView block={block} variant={variant} />;
    case "sitemap":
      return <SitemapBlockView block={block} variant={variant} />;
    default:
      return null;
  }
}

export function getShowcaseBlockSummary(block: ShowcaseBlock) {
  switch (block.type) {
    case "style-guide":
      return `${block.title || "Style guide"} • ${block.principles.length} principios`;
    case "color-palette":
      return `${block.title || "Paleta"} • ${block.colors.length} cores`;
    case "typography":
      return `${block.title || "Tipografia"} • ${block.fonts.length} estilos`;
    case "icon-grid":
      return `${block.title || "Iconografia"} • ${block.icons.length} icones`;
    case "user-flow":
      return `${block.title || "Fluxo"} • ${block.steps.length} etapas`;
    case "sitemap":
      return `${block.title || "Sitemap"} • ${block.sections.length} secoes`;
    default:
      return richTextToPlainText(JSON.stringify(block)).slice(0, 60);
  }
}
