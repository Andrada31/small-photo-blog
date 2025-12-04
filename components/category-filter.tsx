"use client"

import { cn } from "@/lib/utils"

const categories = [
  { id: "all", label: "All" },
  { id: "landscape", label: "Landscape" },
  { id: "portrait", label: "Portrait" },
  { id: "street", label: "Street" },
  { id: "nature", label: "Nature" },
  { id: "architecture", label: "Architecture" },
] as const

interface CategoryFilterProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
            activeCategory === category.id
              ? "bg-foreground text-background"
              : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80",
          )}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}
