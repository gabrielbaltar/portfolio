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
  if (level === 1) return 32;
  if (level === 2) return 24;
  return 18;
}

function getItemIndent(level: 1 | 2 | 3) {
  if (level === 1) return 0;
  if (level === 2) return 18;
  return 34;
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

  if (items.length < 2) return null;

  return (
    <aside className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 min-[1200px]:block" aria-label={label}>
      <div className="group relative flex items-center justify-end">
        <div className="flex flex-col items-end gap-3 rounded-full px-2 py-3">
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
                  height: "4px",
                  backgroundColor: isActive ? "var(--text-primary, #fafafa)" : "rgba(127, 127, 127, 0.28)",
                  opacity: isActive ? 1 : 0.78,
                }}
                aria-label={item.title}
              />
            );
          })}
        </div>

        <div className="pointer-events-none absolute right-full top-1/2 mr-4 w-[320px] -translate-y-1/2 translate-x-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-x-0 group-focus-within:opacity-100">
          <div
            className="rounded-[26px] border p-4"
            style={{
              backgroundColor: "var(--bg-secondary, #121212)",
              borderColor: "var(--border-primary, #2A2A2A)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.22)",
            }}
          >
            <p
              className="px-2"
              style={{
                fontSize: "11px",
                lineHeight: "16px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-secondary, #7A7A7A)",
              }}
            >
              {label}
            </p>

            <nav className="mt-3 max-h-[68vh] overflow-y-auto pr-1">
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
                    className="flex w-full cursor-pointer items-start gap-3 rounded-[16px] px-3 py-2.5 text-left transition-colors"
                    style={{
                      backgroundColor: isActive ? "rgba(255,255,255,0.045)" : "transparent",
                      color: isActive ? "var(--text-primary, #fafafa)" : "var(--text-secondary, #9A9A9A)",
                    }}
                  >
                    <span
                      className="shrink-0"
                      style={{
                        minWidth: item.level === 1 ? "30px" : item.level === 2 ? "42px" : "56px",
                        fontSize: "14px",
                        lineHeight: "20px",
                        color: isActive ? "var(--text-primary, #fafafa)" : "var(--text-secondary, #7A7A7A)",
                      }}
                    >
                      {item.outlineLabel}
                    </span>
                    <span
                      style={{
                        paddingLeft: `${getItemIndent(item.level)}px`,
                        fontSize: "14px",
                        lineHeight: "20px",
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
