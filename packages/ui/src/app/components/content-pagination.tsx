import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";

type ContentPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  previousLabel: string;
  nextLabel: string;
  pageLabel: string;
};

function buildPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis-left" | "ellipsis-right"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    items.push("ellipsis-left");
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages - 1) {
    items.push("ellipsis-right");
  }

  items.push(totalPages);
  return items;
}

export function ContentPagination({
  currentPage,
  totalPages,
  onPageChange,
  previousLabel,
  nextLabel,
  pageLabel,
}: ContentPaginationProps) {
  if (totalPages <= 1) return null;

  const pageItems = buildPageItems(currentPage, totalPages);

  return (
    <nav
      aria-label={pageLabel}
      className="mt-10 flex items-center justify-center"
    >
      <div className="flex items-center gap-2 rounded-full border px-2 py-2" style={{ borderColor: "var(--border-primary, #363636)", backgroundColor: "var(--bg-secondary, #121212)" }}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="cursor-pointer rounded-full text-[13px] text-[var(--text-secondary,#ababab)] hover:text-[var(--text-primary,#fafafa)]"
          aria-label={previousLabel}
        >
          <ChevronLeft size={14} />
          <span className="hidden min-[520px]:inline">{previousLabel}</span>
        </Button>

        <div className="flex items-center gap-1">
          {pageItems.map((item) => {
            if (typeof item !== "number") {
              return (
                <span
                  key={item}
                  className="flex h-9 w-9 items-center justify-center text-[var(--text-secondary,#ababab)]"
                  aria-hidden="true"
                >
                  <MoreHorizontal size={14} />
                </span>
              );
            }

            const isActive = item === currentPage;

            return (
              <Button
                key={item}
                type="button"
                variant={isActive ? "default" : "ghost"}
                size="icon"
                onClick={() => onPageChange(item)}
                className="cursor-pointer rounded-full text-[13px]"
                style={isActive ? {
                  backgroundColor: "var(--text-primary, #fafafa)",
                  color: "var(--bg-primary, #0B0B0D)",
                } : {
                  color: "var(--text-secondary, #ababab)",
                }}
                aria-label={`${pageLabel} ${item}`}
                aria-current={isActive ? "page" : undefined}
              >
                {item}
              </Button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="cursor-pointer rounded-full text-[13px] text-[var(--text-secondary,#ababab)] hover:text-[var(--text-primary,#fafafa)]"
          aria-label={nextLabel}
        >
          <span className="hidden min-[520px]:inline">{nextLabel}</span>
          <ChevronRight size={14} />
        </Button>
      </div>
    </nav>
  );
}
