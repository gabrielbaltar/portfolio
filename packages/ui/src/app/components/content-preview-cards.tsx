import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { ArrowUpRight, ChevronLeft, ChevronRight, Clock, ExternalLink, Lock } from "lucide-react";
import { ContentImage } from "./content-image";
import { buildBackTarget } from "./navigation-state";

type ProjectPreviewCardProps = {
  href: string;
  title: string;
  subtitle?: string;
  image?: string;
  imagePosition?: string;
  galleryImages?: string[];
  galleryPositions?: string[];
  locked?: boolean;
  className?: string;
};

type ArticlePreviewCardProps = {
  href: string;
  title: string;
  description?: string;
  image?: string;
  imagePosition?: string;
  galleryImages?: string[];
  galleryPositions?: string[];
  publisher?: string;
  date?: string;
  category?: string;
  readTime?: string;
  locked?: boolean;
  tags?: string[];
  ctaLabel: string;
  className?: string;
};

type PreviewSlide = {
  key: string;
  src: string;
  position: string;
};

function buildSlides(
  image?: string,
  imagePosition = "50% 50%",
  galleryImages: string[] = [],
  galleryPositions: string[] = [],
) {
  const slides: PreviewSlide[] = [];
  const seen = new Set<string>();

  const appendSlide = (src: string | undefined, position: string | undefined, key: string) => {
    const normalizedSrc = src?.trim() || "";
    if (!normalizedSrc || seen.has(normalizedSrc)) return;

    seen.add(normalizedSrc);
    slides.push({
      key,
      src: normalizedSrc,
      position: position?.trim() || "50% 50%",
    });
  };

  appendSlide(image, imagePosition, "cover");
  galleryImages.forEach((src, index) => {
    appendSlide(src, galleryPositions[index], `gallery-${index}`);
  });

  if (slides.length === 0) {
    slides.push({
      key: "empty",
      src: "",
      position: imagePosition,
    });
  }

  return slides;
}

function PreviewMediaSlider({
  title,
  image,
  imagePosition = "50% 50%",
  galleryImages = [],
  galleryPositions = [],
  aspectRatio,
  frameClassName = "",
  imageClassName = "",
  emptyLabel = "Sem capa",
}: {
  title: string;
  image?: string;
  imagePosition?: string;
  galleryImages?: string[];
  galleryPositions?: string[];
  aspectRatio: string;
  frameClassName?: string;
  imageClassName?: string;
  emptyLabel?: string;
}) {
  const slides = useMemo(
    () => buildSlides(image, imagePosition, galleryImages, galleryPositions),
    [galleryImages, galleryPositions, image, imagePosition],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleSlides = slides.length > 1;

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, slides.length - 1));
  }, [slides.length]);

  const goToPrevious = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const goToNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  const goToSlide = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex(index);
  };

  const activeSlide = slides[activeIndex];

  return (
    <div className="pointer-events-none">
      <div
        className={`relative overflow-hidden ${frameClassName}`}
        style={{ aspectRatio }}
      >
        <ContentImage
          src={activeSlide.src}
          alt={title}
          emptyLabel={emptyLabel}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] ${imageClassName}`}
          position={activeSlide.position}
        />

        {hasMultipleSlides && (
          <>
            <div className="pointer-events-auto absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 items-center justify-between px-3">
              <button
                type="button"
                onClick={goToPrevious}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-[1.03]"
                style={{
                  backgroundColor: "rgba(5, 5, 7, 0.68)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "rgba(250, 250, 250, 0.88)",
                }}
                aria-label="Mostrar imagem anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-[1.03]"
                style={{
                  backgroundColor: "rgba(5, 5, 7, 0.68)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "rgba(250, 250, 250, 0.88)",
                }}
                aria-label="Mostrar proxima imagem"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 flex items-center justify-center px-4 pb-3">
              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-2"
                style={{
                  backgroundColor: "rgba(8, 8, 10, 0.7)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                {slides.map((slide, index) => (
                  <button
                    key={slide.key}
                    type="button"
                    onClick={(event) => goToSlide(event, index)}
                    className="rounded-full transition-all"
                    style={{
                      width: index === activeIndex ? "20px" : "8px",
                      height: "6px",
                      backgroundColor: index === activeIndex ? "rgba(250, 250, 250, 0.92)" : "rgba(250, 250, 250, 0.26)",
                    }}
                    aria-label={`Mostrar imagem ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {hasMultipleSlides && (
          <div
            className="absolute inset-x-0 bottom-0 h-20"
            style={{ background: "linear-gradient(180deg, rgba(11, 11, 13, 0) 0%, rgba(11, 11, 13, 0.6) 100%)" }}
          />
        )}
      </div>
    </div>
  );
}

export function ProjectPreviewCard({
  href,
  title,
  subtitle,
  image,
  imagePosition = "50% 50%",
  galleryImages = [],
  galleryPositions = [],
  locked = false,
  className = "",
}: ProjectPreviewCardProps) {
  const location = useLocation();

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-lg transition-transform duration-300 hover:-translate-y-1 ${className}`}
      style={{
        backgroundColor: "var(--bg-secondary, #121212)",
        border: "1px solid var(--border-primary, #363636)",
      }}
    >
      <Link
        to={href}
        state={{ backTo: buildBackTarget(location) }}
        className="absolute inset-0 z-10 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fafafa]/70"
        aria-label={`Abrir projeto ${title}`}
      />

      <div className="relative z-20">
        <PreviewMediaSlider
          title={title}
          image={image}
          imagePosition={imagePosition}
          galleryImages={galleryImages}
          galleryPositions={galleryPositions}
          aspectRatio="700 / 525"
        />
        {locked && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
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
        className="pointer-events-none relative z-20 flex min-h-[92px] flex-1 flex-col justify-center px-4 py-3"
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
              {subtitle && (
                <p
                  className="line-clamp-1"
                  style={{ fontSize: "14px", lineHeight: "21px", color: "var(--text-secondary, #ababab)" }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <ArrowUpRight
            size={16}
            className="mt-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ color: "var(--text-secondary, #ababab)" }}
          />
        </div>
      </div>
    </article>
  );
}

export function ArticlePreviewCard({
  href,
  title,
  description,
  image,
  imagePosition = "50% 50%",
  galleryImages = [],
  galleryPositions = [],
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
    <article
      className={`group relative flex overflow-hidden rounded-lg transition-transform duration-300 hover:-translate-y-0.5 sm:flex-row ${className}`}
      style={{
        backgroundColor: "var(--bg-secondary, #121212)",
        border: "1px solid var(--border-primary, #363636)",
      }}
    >
      <Link
        to={href}
        state={{ backTo: buildBackTarget(location) }}
        className="absolute inset-0 z-10 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fafafa]/70"
        aria-label={`Abrir artigo ${title}`}
      />

      <div
        className="relative z-20 w-full shrink-0 overflow-hidden sm:w-[280px] md:w-[300px]"
        style={{ borderRight: "1px solid var(--border-secondary, #242424)" }}
      >
        <PreviewMediaSlider
          title={title}
          image={image}
          imagePosition={imagePosition}
          galleryImages={galleryImages}
          galleryPositions={galleryPositions}
          aspectRatio="3 / 2"
        />
      </div>

      <div className="pointer-events-none relative z-20 flex min-h-[226px] flex-1 flex-col justify-between px-4 py-4">
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
    </article>
  );
}
