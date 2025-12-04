-- Simplify photos table to use storage_path only (no URLs)
-- Run this in Supabase SQL Editor

-- First, add storage_path column if it doesn't exist
ALTER TABLE photos ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Migrate existing data: extract filename from thumbnail_path if it's a URL
UPDATE photos 
SET storage_path = 
  CASE 
    WHEN thumbnail_path LIKE 'http%' THEN SUBSTRING(thumbnail_path FROM '[^/]+\.[^/]+$')
    ELSE thumbnail_path
  END
WHERE storage_path IS NULL;

-- Make storage_path NOT NULL after migration
-- ALTER TABLE photos ALTER COLUMN storage_path SET NOT NULL;

-- Drop the old URL columns (run after confirming migration worked)
-- ALTER TABLE photos DROP COLUMN IF EXISTS thumbnail_path;
-- ALTER TABLE photos DROP COLUMN IF EXISTS full_size_path;

-- For now, keep both columns but use storage_path as primary