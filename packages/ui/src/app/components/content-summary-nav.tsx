import { slugify, type ContentBlock } from "@portfolio/core";
import { useEffect, useState } from "react";
import { richTextToPlainText } from "./rich-text";
import { isShowcaseBlock } from "./showcase-blocks";

export type ContentSummaryItem = {
  id: string;
  title: string;
  level: 1 | 2 | 3;
  blockIndex: number;
  outlineLabel: string;
};

function buildOutlineLabel(level: 1 | 2 | 3, counters: { level1: number; level2: number; level3: number }) {
  if (level === 1) {
    counters.level1 += 1;
    counters.level2 = 0;
    counters.level3 = 0;
    return `${counters.level1}.`;
  }

  if (level === 2) {
    if (counters.level1 === 0) counters.level1 = 1;
    counters.level2 += 1;
    counters.level3 = 0;
    return `${counters.level1}.${counters.level2}`;
  }

  if (counters.level1 === 0) counters.level1 = 1;
  if (counters.level2 === 0) counters.level2 = 1;
  counters.level3 += 1;
  return `${counters.level1}.${counters.level2}.${counters.level3}`;
}

function getSummaryEntry(block: ContentBlock): { title: string; level: 1 | 2 | 3 } | null {
  if (block.type === "heading1" || block.type === "heading2" || block.type === "heading3") {
    const title = richTextToPlainText(block.text || "").trim();
    if (!title) return null;

    return {
      title,
      level: block.type === "heading1" ? 1 : block.type === "heading2" ? 2 : 3,
    };
  }

  if (isShowcaseBlock(block)) {
    const title = richTextToPlainText(block.title || "").trim();
    if (!title) return null;

    return {
      title,
      level: 2,
    };
  }

  return null;
}

function getRailWidth(level: 1 | 2 | 3) {
  if (level === 1) return 24;
  if (level === 2) return 18;
  return 12;
}

function getItemIndent(level: 1 | 2 | 3) {
  if (level === 1) return 0;
  if (level === 2) return 14;
  return 26;
}

function scrollToHeading(id: string) {
  if (typeof window === "undefined") return;

  const element = document.getElementById(id);
  if (!element) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = element.getBoundingClientRect().top + window.scrollY - 120;

  window.scrollTo({
    top,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });

  window.history.replaceState(window.history.state, "", `#${id}`);
}

export function buildContentSummaryItems(blocks: ContentBlock[] | undefined, prefix: string): ContentSummaryItem[] {
  if (!blocks?.length) return [];

  const counters = { level1: 0, level2: 0, level3: 0 };
  const usedIds = new Map<string, number>();

  return blocks.flatMap((block, blockIndex) => {
    const entry = getSummaryEntry(block);
    if (!entry) return [];

    const baseId = slugify(entry.title) || `section-${blockIndex + 1}`;
    const repeatedCount = usedIds.get(baseId) || 0;
    usedIds.set(baseId, repeatedCount + 1);

    return [{
      id: repeatedCount === 0 ? `${prefix}-${baseId}` : `${prefix}-${baseId}-${repeatedCount + 1}`,
      title: entry.title,
      level: entry.level,
      blockIndex,
      outlineLabel: buildOutlineLabel(entry.level, counters),
    }];
  });
}

export function ContentSummaryNav({
  items,
  label,
}: {
  items: ContentSummaryItem[];
  label: string;
}) {
  const [activeId, setActiveId] = useState(items[0]?.id || "");
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const idsKey = items.map((item) => item.id).join("|");

  useEffect(() => {
    if (!items.length) {
      setActiveId("");
      return;
    }

    setActiveId((current) => (items.some((item) => item.id === current) ? current : items[0].id));
  }, [idsKey, items]);

  useEffect(() => {
    if (typeof window === "undefined" || items.length === 0) return;

    let frame = 0;

    const updateActiveItem = () => {
      frame = 0;
      const threshold = 170;
      let nextActiveId = items[0].id;

      for (const item of items) {
        const element = document.getElementById(item.id);
        if (!element) continue;

        if (element.getBoundingClientRect().top <= threshold) {
          nextActiveId = item.id;
        } else {
          break;
        }
      }

      setActiveId(nextActiveId);
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveItem);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [idsKey, items]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");

    const syncViewport = () => {
      setIsDesktopViewport(mediaQuery.matches);
      if (!mediaQuery.matches) setIsOpen(false);
    };

    syncViewport();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncViewport);
      return () => mediaQuery.removeEventListener("change", syncViewport);
    }

    mediaQuery.addListener(syncViewport);
    return () => mediaQuery.removeListener(syncViewport);
  }, []);

  if (items.length < 2 || !isDesktopViewport) return null;

  return (
    <aside
      className="fixed right-6 top-1/2 z-30 w-[268px] -translate-y-1/2 overflow-visible"
      aria-label={label}
    >
      <div
        className="relative flex w-full items-center justify-end overflow-visible"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocusCapture={() => setIsOpen(true)}
        onBlurCapture={(event) => {
          const nextFocusedElement = event.relatedTarget;
          if (nextFocusedElement instanceof Node && event.currentTarget.contains(nextFocusedElement)) return;
          setIsOpen(false);
        }}
      >
        <div
          className="relative z-10 flex flex-col items-end gap-2 rounded-full px-1.5 py-2 transition-opacity duration-200"
          style={{ opacity: isOpen ? 0 : 0.62, pointerEvents: isOpen ? "none" : "auto" }}
          aria-hidden={isOpen}
        >
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveId(item.id);
                  scrollToHeading(item.id);
                }}
                className="cursor-pointer rounded-full transition-all duration-200 hover:opacity-100"
                style={{
                  width: `${getRailWidth(item.level)}px`,
                  height: "3px",
                  backgroundColor: isActive ? "var(--text-primary, #fafafa)" : "rgba(127, 127, 127, 0.28)",
                  opacity: isActive ? 1 : 0.78,
                }}
                aria-label={item.title}
              />
            );
          })}
        </div>

        <div
          className="absolute right-0 top-1/2 z-20 w-[244px] -translate-y-1/2 transition-all duration-180"
          style={{
            opacity: isOpen ? 1 : 0,
            transform: `translateY(-50%) translateX(${isOpen ? "0px" : "10px"}) scale(${isOpen ? 1 : 0.985})`,
            pointerEvents: isOpen ? "auto" : "none",
          }}
        >
          <div
            className="flex flex-col rounded-[22px] border p-3"
            style={{
              backgroundColor: "var(--bg-secondary, #121212)",
              borderColor: "var(--border-primary, #2A2A2A)",
              boxShadow: "0 18px 44px rgba(0, 0, 0, 0.18)",
              boxSizing: "border-box",
              maxHeight: "min(620px, calc(100vh - 120px))",
              overflow: "hidden",
            }}
          >
            <p
              className="px-1.5"
              style={{
                fontSize: "10px",
                lineHeight: "14px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-secondary, #7A7A7A)",
              }}
            >
              {label}
            </p>

            <nav
              className="summary-nav-scroll mt-2.5 overflow-y-auto pr-1"
              style={{
                flex: "1 1 auto",
                minHeight: 0,
                overscrollBehavior: "contain",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {items.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveId(item.id);
                      scrollToHeading(item.id);
                    }}
                    className="flex w-full cursor-pointer items-start gap-2 rounded-[14px] px-2.5 py-1.5 text-left transition-colors"
                    style={{
                      backgroundColor: isActive ? "rgba(255,255,255,0.045)" : "transparent",
                      color: isActive ? "var(--text-primary, #fafafa)" : "var(--text-secondary, #9A9A9A)",
                    }}
                  >
                    <span
                      className="shrink-0"
                      style={{
                        minWidth: item.level === 1 ? "24px" : item.level === 2 ? "36px" : "48px",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: isActive ? "var(--text-primary, #fafafa)" : "var(--text-secondary, #7A7A7A)",
                      }}
                    >
                      {item.outlineLabel}
                    </span>
                    <span
                      style={{
                        paddingLeft: `${getItemIndent(item.level)}px`,
                        fontSize: "12px",
                        lineHeight: "18px",
                      }}
                    >
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}
