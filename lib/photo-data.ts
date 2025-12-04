import { createClient } from "@/lib/supabase/server"

export type PhotoCategory = "landscape" | "portrait" | "street" | "nature" | "architecture"

const BUCKET_NAME = "photos"

export interface PhotoMetadata {
  id: string
  title: string
  description: string | null
  thumbnail: string
  fullSize: string
  camera: string | null
  lens: string | null
  aperture: string | null
  shutterSpeed: string | null
  iso: string | null
  focalLength: string | null
  dateTaken: string | null
  location: string | null
  category: PhotoCategory | null
  // Keep storage path for deletion purposes
  storagePath: string
}

// Database row type from Supabase
interface PhotoRow {
  id: string
  title: string
  description: string | null
  storage_path: string
  thumbnail_path?: string // Legacy, may still exist
  full_size_path?: string // Legacy, may still exist
  camera: string | null
  lens: string | null
  aperture: string | null
  shutter_speed: string | null
  iso: string | null
  focal_length: string | null
  date_taken: string | null
  location: string | null
  category: PhotoCategory | null
}

// Get public URL from storage path
function getStorageUrl(supabaseUrl: string, storagePath: string): string {
  // Construct the public URL directly
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`
}

// Transform database row to PhotoMetadata
function transformPhoto(row: PhotoRow, supabaseUrl: string): PhotoMetadata {
  // Use storage_path if available, fallback to thumbnail_path
  const storagePath = row.storage_path || row.thumbnail_path || ""
  const publicUrl = getStorageUrl(supabaseUrl, storagePath)

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    thumbnail: publicUrl,
    fullSize: publicUrl, // Same image for both
    camera: row.camera,
    lens: row.lens,
    aperture: row.aperture,
    shutterSpeed: row.shutter_speed,
    iso: row.iso,
    focalLength: row.focal_length,
    dateTaken: row.date_taken,
    location: row.location,
    category: row.category,
    storagePath: storagePath,
  }
}

// Fetch all photos from Supabase
export async function getPhotos(
  category?: PhotoCategory | "all",
  page = 1,
  perPage = 40,
): Promise<{ photos: PhotoMetadata[]; total: number }> {
  const supabase = await createClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""

  // Build query
  let query = supabase.from("photos").select("*", { count: "exact" }).order("date_taken", { ascending: false })

  // Apply category filter
  if (category && category !== "all") {
    query = query.eq("category", category)
  }

  // Apply pagination
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching photos:", error)
    return { photos: [], total: 0 }
  }

  return {
    photos: (data as PhotoRow[]).map((row) => transformPhoto(row, supabaseUrl)),
    total: count || 0,
  }
}

// Fetch a single photo by ID
export async function getPhotoById(id: string): Promise<PhotoMetadata | null> {
  const supabase = await createClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""

  const { data, error } = await supabase.from("photos").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching photo:", error)
    return null
  }

  return transformPhoto(data as PhotoRow, supabaseUrl)
}

// Get total count of photos
export async function getPhotoCount(category?: PhotoCategory | "all"): Promise<number> {
  const supabase = await createClient()

  let query = supabase.from("photos").select("*", { count: "exact", head: true })

  if (category && category !== "all") {
    query = query.eq("category", category)
  }

  const { count, error } = await query

  if (error) {
    console.error("Error counting photos:", error)
    return 0
  }

  return count || 0
}

// Get total number of pages
export function getTotalPages(total: number, perPage = 40): number {
  return Math.ceil(total / perPage)
}