"use client";

import type React from "react";

import { useState, useRef } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, Upload, Loader2, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface PhotoUploadFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const categories = [
  { value: "landscape", label: "Landscape" },
  { value: "portrait", label: "Portrait" },
  { value: "street", label: "Street" },
  { value: "nature", label: "Nature" },
  { value: "architecture", label: "Architecture" },
];

const BUCKET_NAME = "photos";

export default function PhotoUploadForm({
  onClose,
  onSuccess,
}: PhotoUploadFormProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    camera: "",
    lens: "",
    aperture: "",
    shutterSpeed: "",
    iso: "",
    focalLength: "",
    location: "",
    dateTaken: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setError("");

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!selectedFile) {
      setError("Please select an image to upload");
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();

      // Generate unique filename
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      // Insert record into photos table - ONLY storage_path, no thumbnail_path or full_size_path
      const { error: insertError } = await supabase.from("photos").insert({
        title: formData.title,
        description: formData.description || null,
        storage_path: uploadData.path,
        camera: formData.camera || null,
        lens: formData.lens || null,
        aperture: formData.aperture || null,
        shutter_speed: formData.shutterSpeed || null,
        iso: formData.iso || null,
        focal_length: formData.focalLength || null,
        location: formData.location || null,
        date_taken: formData.dateTaken || null,
        category: formData.category || null,
      });

      if (insertError) {
        // Rollback: delete uploaded file if DB insert fails
        await supabase.storage.from(BUCKET_NAME).remove([uploadData.path]);
        throw insertError;
      }

      onSuccess();
    } catch (err) {
      console.error("Upload error:", err);
      // Show more detailed error message
      let errorMessage = "Failed to upload photo. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null) {
        errorMessage = JSON.stringify(err);
      }
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Cleanup preview URL on unmount
  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-border/50 bg-card">
      <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-card z-10 border-b border-border/50">
        <div>
          <CardTitle className="font-heading tracking-wide">
            Upload Photo
          </CardTitle>
          <CardDescription>Add a new photo to your portfolio</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground">
              Image *
            </h3>

            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {selectedFile?.name}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearPreview();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to select an image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground">
              Basic Info
            </h3>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g., Sunset Over Mountains"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Brief description of the photo..."
                className="bg-background/50 resize-none"
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
                  <SelectTrigger className="bg-background/50">
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
                  placeholder="e.g., Yosemite, CA"
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTaken">Date Taken</Label>
              <Input
                id="dateTaken"
                type="date"
                value={formData.dateTaken}
                onChange={(e) => handleChange("dateTaken", e.target.value)}
                className="bg-background/50"
              />
            </div>
          </div>

          {/* Camera Metadata */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground">
              Camera Metadata
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="camera">Camera</Label>
                <Input
                  id="camera"
                  value={formData.camera}
                  onChange={(e) => handleChange("camera", e.target.value)}
                  placeholder="e.g., Sony A7 IV"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lens">Lens</Label>
                <Input
                  id="lens"
                  value={formData.lens}
                  onChange={(e) => handleChange("lens", e.target.value)}
                  placeholder="e.g., 24-70mm f/2.8"
                  className="bg-background/50"
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
                  placeholder="f/2.8"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shutterSpeed">Shutter Speed</Label>
                <Input
                  id="shutterSpeed"
                  value={formData.shutterSpeed}
                  onChange={(e) => handleChange("shutterSpeed", e.target.value)}
                  placeholder="1/250s"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iso">ISO</Label>
                <Input
                  id="iso"
                  value={formData.iso}
                  onChange={(e) => handleChange("iso", e.target.value)}
                  placeholder="100"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="focalLength">Focal Length</Label>
                <Input
                  id="focalLength"
                  value={formData.focalLength}
                  onChange={(e) => handleChange("focalLength", e.target.value)}
                  placeholder="50mm"
                  className="bg-background/50"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading || !selectedFile}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
