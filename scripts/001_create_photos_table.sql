-- Create photos table for photographer portfolio
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  -- Storage paths for images (stored in Supabase Storage)
  thumbnail_path TEXT NOT NULL,
  full_size_path TEXT NOT NULL,
  -- Camera metadata
  camera TEXT,
  lens TEXT,
  aperture TEXT,
  shutter_speed TEXT,
  iso TEXT,
  focal_length TEXT,
  -- Additional metadata
  date_taken DATE,
  location TEXT,
  category TEXT CHECK (category IN ('landscape', 'portrait', 'street', 'nature', 'architecture')),
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_photos_category ON photos(category);

-- Create index for date sorting
CREATE INDEX IF NOT EXISTS idx_photos_date_taken ON photos(date_taken DESC);

-- Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Allow public read access to photos (portfolio is public)
CREATE POLICY "Allow public read access to photos"
  ON photos FOR SELECT
  USING (true);
