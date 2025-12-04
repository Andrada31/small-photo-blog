"use client";

import type React from "react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PhotoMetadata } from "@/lib/photo-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X } from "lucide-react";

interface PhotoEditModalProps {
  photo: PhotoMetadata;
  onClose: () => void;
  onUpdated: () => void;
}

const categories = [
  { value: "landscape", label: "Landscape" },
  { value: "portrait", label: "Portrait" },
  { value: "street", label: "Street" },
  { value: "nature", label: "Nature" },
  { value: "architecture", label: "Architecture" },
];

export function PhotoEditModal({
  photo,
  onClose,
  onUpdated,
}: PhotoEditModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: photo.title ?? "",
    description: photo.description ?? "",
    category: photo.category ?? "",
    camera: photo.camera ?? "",
    lens: photo.lens ?? "",
    aperture: photo.aperture ?? "",
    shutterSpeed: photo.shutterSpeed ?? "",
    iso: photo.iso ?? "",
    focalLength: photo.focalLength ?? "",
    location: photo.location ?? "",
    dateTaken: photo.dateTaken ?? "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("photos")
        .update({
          title: formData.title,
          description: formData.description || null,
          category: formData.category || null,
          camera: formData.camera || null,
          lens: formData.lens || null,
          aperture: formData.aperture || null,
          shutter_speed: formData.shutterSpeed || null,
          iso: formData.iso || null,
          focal_length: formData.focalLength || null,
          location: formData.location || null,
          date_taken: formData.dateTaken || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", photo.id);

      if (updateError) throw updateError;

      onUpdated();
    } catch (err) {
      console.error("Update error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update photo metadata."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-border/50 bg-card">
        <CardHeader className="flex items-center justify-between border-b border-border/50 bg-card sticky top-0 z-10">
          <div>
            <CardTitle>Edit Photo</CardTitle>
            <CardDescription>Update metadata for this photo</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTaken">Date Taken</Label>
              <Input
                id="dateTaken"
                type="date"
                value={formData.dateTaken ?? ""}
                onChange={(e) => handleChange("dateTaken", e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Camera Metadata
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="camera">Camera</Label>
                  <Input
                    id="camera"
                    value={formData.camera}
                    onChange={(e) => handleChange("camera", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lens">Lens</Label>
                  <Input
                    id="lens"
                    value={formData.lens}
                    onChange={(e) => handleChange("lens", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aperture">Aperture</Label>
                  <Input
                    id="aperture"
                    value={formData.aperture}
                    onChange={(e) => handleChange("aperture", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shutterSpeed">Shutter Speed</Label>
                  <Input
                    id="shutterSpeed"
                    value={formData.shutterSpeed}
                    onChange={(e) =>
                      handleChange("shutterSpeed", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iso">ISO</Label>
                  <Input
                    id="iso"
                    value={formData.iso}
                    onChange={(e) => handleChange("iso", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="focalLength">Focal Length</Label>
                  <Input
                    id="focalLength"
                    value={formData.focalLength}
                    onChange={(e) =>
                      handleChange("focalLength", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
