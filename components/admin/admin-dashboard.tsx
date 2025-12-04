"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, LogOut, Plus, Trash2, RefreshCw } from "lucide-react";
import { PhotoEditModal } from "@/components/admin/photo-edit-modal";
import PhotoUploadForm from "./photo-upload-form";
import { createClient } from "@/lib/supabase/client";
import type { PhotoMetadata } from "@/lib/photo-data";
import Image from "next/image";

interface AdminDashboardProps {
  onLogout: () => void;
}

interface PhotoRow {
  id: string;
  title: string;
  description: string | null;
  storage_path: string;
  thumbnail_path?: string;
  full_size_path?: string;
  camera: string | null;
  lens: string | null;
  aperture: string | null;
  shutter_speed: string | null;
  iso: string | null;
  focal_length: string | null;
  date_taken: string | null;
  location: string | null;
  category: string | null;
}

const BUCKET_NAME = "photos";

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [photos, setPhotos] = useState<
    (PhotoMetadata & { storagePath: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<PhotoMetadata | null>(null);

  const getPublicUrl = (storagePath: string): string => {
    if (!storagePath) return "";
    // If it's already a full URL, return it
    if (
      storagePath.startsWith("http://") ||
      storagePath.startsWith("https://")
    ) {
      return storagePath;
    }
    // Construct the public URL from storage
    const supabase = createClient();
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);
    return data.publicUrl;
  };

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedPhotos = (data as PhotoRow[]).map((row) => {
        // Use storage_path if available, fallback to thumbnail_path
        const storagePath = row.storage_path || row.thumbnail_path || "";
        const publicUrl = getPublicUrl(storagePath);

        return {
          id: row.id,
          title: row.title,
          description: row.description,
          thumbnail: publicUrl,
          fullSize: publicUrl,
          camera: row.camera,
          lens: row.lens,
          aperture: row.aperture,
          shutterSpeed: row.shutter_speed,
          iso: row.iso,
          focalLength: row.focal_length,
          dateTaken: row.date_taken,
          location: row.location,
          category: row.category as PhotoMetadata["category"],
          storagePath: storagePath,
        };
      });

      setPhotos(transformedPhotos);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    setDeleting(id);
    try {
      const supabase = createClient();

      // Find the photo to get its storage path
      const photo = photos.find((p) => p.id === id);

      if (photo && photo.storagePath && !photo.storagePath.startsWith("http")) {
        // Delete from storage bucket
        const { error: storageError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([photo.storagePath]);

        if (storageError) {
          console.error("Storage delete error:", storageError);
          // Continue with DB deletion even if storage fails
        }
      }

      // Delete from database
      const { error } = await supabase.from("photos").delete().eq("id", id);

      if (error) throw error;

      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to delete photo");
    } finally {
      setDeleting(null);
    }
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    fetchPhotos();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-heading text-xl tracking-wide uppercase">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPhotos}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowUploadForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showUploadForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <PhotoUploadForm
              onClose={() => setShowUploadForm(false)}
              onSuccess={handleUploadSuccess}
            />
          </div>
        )}

        {editingPhoto && (
          <PhotoEditModal
            photo={editingPhoto}
            onClose={() => setEditingPhoto(null)}
            onUpdated={() => {
              setEditingPhoto(null);
              fetchPhotos();
            }}
          />
        )}

        <div className="mb-6">
          <h2 className="font-heading text-lg tracking-wide mb-1">
            Photos ({photos.length})
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage your portfolio photos
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground mb-4">No photos uploaded yet</p>
            <Button onClick={() => setShowUploadForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Your First Photo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
              >
                <button
                  type="button"
                  className="absolute inset-0 z-10"
                  onClick={() => setEditingPhoto(photo)}
                  aria-label={`Edit ${photo.title}`}
                />
                <Image
                  src={
                    photo.thumbnail || "/placeholder.svg?height=200&width=200"
                  }
                  alt={photo.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-white text-sm font-medium truncate">
                        {photo.title}
                      </p>
                      {photo.category && (
                        <p className="text-white/70 text-xs capitalize">
                          {photo.category}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 text-white bg-white/20 hover:bg-white/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPhoto(photo);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo.id);
                    }}
                    disabled={deleting === photo.id}
                  >
                    {deleting === photo.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
