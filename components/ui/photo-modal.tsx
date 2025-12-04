"use client"

import { useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Camera, Calendar, MapPin } from "lucide-react"
import type { PhotoMetadata } from "@/lib/photo-data"

interface PhotoModalProps {
  photo: PhotoMetadata | null
  isOpen: boolean
  onClose: () => void
}

export function PhotoModal({ photo, isOpen, onClose }: PhotoModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, handleEscape])

  if (!photo) return null

  const formattedDate = new Date(photo.dateTaken).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/95 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex flex-col lg:flex-row max-w-6xl w-full max-h-[90vh] bg-card rounded-lg overflow-hidden shadow-2xl border border-border"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>

            {/* Image Section */}
            <div className="relative flex-1 min-h-[300px] lg:min-h-[500px] bg-secondary">
              <img
                src={photo.fullSize || "/placeholder.svg"}
                alt={photo.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Metadata Section */}
            <div className="w-full lg:w-96 p-6 lg:p-8 overflow-y-auto bg-card">
              <h2 className="font-serif text-2xl lg:text-3xl font-bold text-foreground mb-2">{photo.title}</h2>
              <p className="text-muted-foreground mb-6">{photo.description}</p>

              {/* Location & Date */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span className="text-foreground">{photo.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span className="text-foreground">{formattedDate}</span>
                </div>
              </div>

              {/* Camera Info */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-5 h-5 text-accent" />
                  <h3 className="font-medium text-foreground">Camera Settings</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MetadataItem label="Camera" value={photo.camera} />
                  <MetadataItem label="Lens" value={photo.lens} />
                  <MetadataItem label="Aperture" value={photo.aperture} />
                  <MetadataItem label="Shutter" value={photo.shutterSpeed} />
                  <MetadataItem label="ISO" value={photo.iso} />
                  <MetadataItem label="Focal Length" value={photo.focalLength} />
                </div>
              </div>

              {/* Category Badge */}
              <div className="mt-6 pt-6 border-t border-border">
                <span className="inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider bg-secondary text-secondary-foreground rounded-full">
                  {photo.category}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-foreground font-medium truncate" title={value}>
        {value}
      </p>
    </div>
  )
}
