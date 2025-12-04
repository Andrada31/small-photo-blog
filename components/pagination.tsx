"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl?: string
}

export function Pagination({ currentPage, totalPages, baseUrl = "/" }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageUrl = (page: number) => {
    if (page === 1) return baseUrl
    return `${baseUrl}?page=${page}`
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push("ellipsis")
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis")
      }

      pages.push(totalPages)
    }

    return pages
  }

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      {/* Previous Button */}
      <Link
        href={currentPage > 1 ? getPageUrl(currentPage - 1) : "#"}
        className={cn(
          "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
          currentPage > 1
            ? "text-foreground hover:bg-secondary"
            : "text-muted-foreground pointer-events-none opacity-50",
        )}
        aria-disabled={currentPage <= 1}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </Link>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={getPageUrl(page)}
              className={cn(
                "w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors",
                currentPage === page
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </Link>
          ),
        )}
      </div>

      {/* Next Button */}
      <Link
        href={currentPage < totalPages ? getPageUrl(currentPage + 1) : "#"}
        className={cn(
          "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
          currentPage < totalPages
            ? "text-foreground hover:bg-secondary"
            : "text-muted-foreground pointer-events-none opacity-50",
        )}
        aria-disabled={currentPage >= totalPages}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </nav>
  )
}
