import { Link, useLocation } from "react-router";
import { ArrowUpRight, Clock, ExternalLink, Lock } from "lucide-react";
import { ContentImage } from "./content-image";
import { buildBackTarget } from "./navigation-state";

type ProjectPreviewCardProps = {
  href: string;
  title: string;
  category?: string;
  image?: string;
  imagePosition?: string;
  locked?: boolean;
  className?: string;
};

type ArticlePreviewCardProps = {
  href: string;
  title: string;
  description?: string;
  image?: string;
  imagePosition?: string;
  publisher?: string;
  date?: string;
  category?: string;
  readTime?: string;
  locked?: boolean;
  tags?: string[];
  ctaLabel: string;
  className?: string;
};

export function ProjectPreviewCard({
  href,
  title,
  category,
  image,
  imagePosition = "50% 50%",
  locked = false,
  className = "",
}: ProjectPreviewCardProps) {
  const location = useLocation();

  return (
    <Link
      to={href}
      state={{ backTo: buildBackTarget(location) }}
      className={`group flex h-full flex-col overflow-hidden rounded-lg transition-transform duration-300 hover:-translate-y-1 ${className}`}
      style={{
        backgroundColor: "var(--bg-secondary, #121212)",
        border: "1px solid var(--border-primary, #363636)",
      }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "700 / 525" }}>
        <ContentImage
          src={image}
          alt={title}
          emptyLabel="Sem capa"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          position={imagePosition}
        />
        {locked && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Lock size={16} style={{ color: "rgba(255, 255, 255, 0.8)" }} />
            </div>
          </div>
        )}
      </div>

      <div
        className="flex min-h-[92px] flex-1 flex-col justify-between px-4 py-3"
        style={{ borderTop: "1px solid var(--border-secondary, #242424)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-1.5">
            {locked && <Lock size={13} className="mt-[5px] shrink-0" style={{ color: "#ffa500", opacity: 0.7 }} />}
            <div className="min-w-0 flex-1">
              <p
                className="min-h-[48px] overflow-hidden text-ellipsis break-words"
                style={{ fontSize: "16px", lineHeight: "24px", color: "var(--text-primary, #fafafa)" }}
              >
                <span
                  className="min-w-0 flex-1 overflow-hidden text-ellipsis break-words"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {title}
                </span>
              </p>
              <p
                className="line-clamp-1"
                style={{ fontSize: "14px", lineHeight: "21px", color: "var(--text-secondary, #ababab)" }}
              >
                {category || "Sem categoria"}
              </p>
            </div>
          </div>
          <ArrowUpRight
            size={16}
            className="mt-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ color: "var(--text-secondary, #ababab)" }}
          />
        </div>
      </div>
    </Link>
  );
}

export function ArticlePreviewCard({
  href,
  title,
  description,
  image,
  imagePosition = "50% 50%",
  publisher,
  date,
  category,
  readTime,
  locked = false,
  tags = [],
  ctaLabel,
  className = "",
}: ArticlePreviewCardProps) {
  const location = useLocation();
  const visibleTags = tags.slice(0, 3);

  return (
    <Link
      to={href}
      state={{ backTo: buildBackTarget(location) }}
      className={`group flex overflow-hidden rounded-lg transition-transform duration-300 hover:-translate-y-0.5 sm:flex-row ${className}`}
      style={{
        backgroundColor: "var(--bg-secondary, #121212)",
        border: "1px solid var(--border-primary, #363636)",
      }}
    >
      <div
        className="w-full shrink-0 overflow-hidden sm:w-[280px] md:w-[300px]"
        style={{ aspectRatio: "3 / 2", borderRight: "1px solid var(--border-secondary, #242424)" }}
      >
        <ContentImage
          src={image}
          alt={title}
          emptyLabel="Sem capa"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          position={imagePosition}
        />
      </div>

      <div className="flex min-h-[226px] flex-1 flex-col justify-between px-4 py-4">
        <div>
          <h3
            className="flex min-h-[48px] min-w-0 items-start gap-1.5"
            style={{ fontSize: "16px", lineHeight: "24px", color: "var(--text-primary, #fafafa)" }}
          >
            {locked && <Lock size={13} className="mt-[5px] shrink-0" style={{ color: "#ffa500", opacity: 0.7 }} />}
            <span
              className="min-w-0 flex-1 overflow-hidden text-ellipsis break-words"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {title}
            </span>
          </h3>

          <div
            className="mt-2 flex min-h-[44px] flex-wrap items-center gap-x-3 gap-y-1"
            style={{ fontSize: "14px", lineHeight: "21px", color: "var(--text-secondary, #ababab)" }}
          >
            {(publisher || date) && <span>{[publisher, date].filter(Boolean).join(", ")}</span>}
            {category && <span>{category}</span>}
            {readTime && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={11} />
                {readTime}
              </span>
            )}
          </div>

          <p
            className="mt-3 min-h-[67px] line-clamp-3"
            style={{ fontSize: "15px", lineHeight: "22.4px", color: "var(--text-secondary, #ababab)" }}
          >
            {description || "Sem descricao"}
          </p>

          <div className="mt-3 min-h-[24px]">
            {visibleTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 overflow-hidden">
                {visibleTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-[8px] px-2"
                    style={{
                      height: "22.5px",
                      lineHeight: "16.5px",
                      fontSize: "11px",
                      backgroundColor: "var(--bg-primary, #0B0B0D)",
                      border: "1px solid var(--border-primary, #363636)",
                      color: "var(--text-secondary, #ababab)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <span
          className="mt-4 inline-flex items-center gap-1 underline underline-offset-4"
          style={{
            fontSize: "16px",
            lineHeight: "24px",
            color: "var(--text-primary, #fafafa)",
            textDecorationColor: "var(--border-primary, #363636)",
          }}
        >
          {ctaLabel} <ExternalLink size={14} />
        </span>
      </div>
    </Link>
  );
}
