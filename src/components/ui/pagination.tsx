import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...")
      }
    }
    return pages
  }

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("flex items-center justify-center gap-1.5 pt-8 select-none", className)}
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-forest/70 hover:text-forest hover:bg-champagne border border-forest/15 rounded-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <ChevronLeft className="size-4" />
        Prev
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, idx) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 py-1 text-xs text-forest/40 flex items-center justify-center"
              >
                <MoreHorizontal className="size-4" />
              </span>
            )
          }

          const isCurrent = page === currentPage
          return (
            <button
              key={`page-${page}`}
              type="button"
              onClick={() => onPageChange(page as number)}
              className={cn(
                "size-8 text-xs font-semibold rounded-xs transition-colors cursor-pointer",
                isCurrent
                  ? "bg-forest text-ghost-white"
                  : "text-forest/70 hover:text-forest hover:bg-champagne border border-forest/15"
              )}
            >
              {page}
            </button>
          )
        })}
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-forest/70 hover:text-forest hover:bg-champagne border border-forest/15 rounded-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        Next
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}
