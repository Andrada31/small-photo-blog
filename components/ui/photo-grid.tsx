"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "motion/react"
import type { PhotoMetadata } from "@/lib/photo-data"
import { PhotoModal } from "./photo-modal"

interface PhotoGridProps {
  photos: PhotoMetadata[]
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(null)
  const [columns, setColumns] = useState(4)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 640) setColumns(1)
      else if (width < 768) setColumns(2)
      else if (width < 1024) setColumns(3)
      else setColumns(4)
    }

    updateColumns()
    window.addEventListener("resize", updateColumns)
    return () => window.removeEventListener("resize", updateColumns)
  }, [])

  const distributePhotos = () => {
    const columnArrays: PhotoMetadata[][] = Array.from({ length: columns }, () => [])
    const columnHeights: number[] = Array(columns).fill(0)

    photos.forEach((photo, index) => {
      // Find the shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
      columnArrays[shortestColumnIndex].push(photo)
      const estimatedHeight = 200 + (index % 3) * 100
      columnHeights[shortestColumnIndex] += estimatedHeight
    })

    return columnArrays
  }

  const columnData = distributePhotos()

  return (
    <>
      <div ref={containerRef} className="flex gap-3 md:gap-4">
        {columnData.map((column, columnIndex) => (
          <div key={columnIndex} className="flex-1 flex flex-col gap-3 md:gap-4">
            {column.map((photo, photoIndex) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (columnIndex * column.length + photoIndex) * 0.03, duration: 0.4 }}
                className="relative group cursor-pointer overflow-hidden rounded-lg"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.thumbnail || "/placeholder.svg"}
                  alt={photo.title}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-1">{photo.title}</h3>
                    <p className="text-sm text-muted-foreground">{photo.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      <PhotoModal photo={selectedPhoto} isOpen={!!selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </>
  )
}
