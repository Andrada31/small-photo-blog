"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { PhotoGrid } from "@/components/ui/photo-grid"
import { Pagination } from "@/components/pagination"
import { CategoryFilter } from "@/components/category-filter"
import type { PhotoMetadata, PhotoCategory } from "@/lib/photo-data"

interface PhotoGalleryProps {
  initialPhotos: PhotoMetadata[]
  totalPhotos: number
  currentPage: number
  totalPages: number
  activeCategory: PhotoCategory | "all"
}

export function PhotoGallery({
  initialPhotos,
  totalPhotos,
  currentPage,
  totalPages,
  activeCategory,
}: PhotoGalleryProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category === "all") {
      params.delete("category")
    } else {
      params.set("category", category)
    }
    // Reset to page 1 when changing category
    params.delete("page")
    router.push(`?${params.toString()}`)
  }

  return (
    <>
      {/* Category Filter */}
      <section className="mb-8 md:mb-12">
        <CategoryFilter activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
      </section>

      {/* Photo Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {initialPhotos.length} of {totalPhotos} photos
        </p>
        {totalPages > 1 && (
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      {/* Photo Grid */}
      {initialPhotos.length > 0 ? (
        <PhotoGrid photos={initialPhotos} />
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No photos found in this category.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 md:mt-16">
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </>
  )
}
