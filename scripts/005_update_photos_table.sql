-- Update photos table to work with storage bucket instead of CDN URLs
-- Add a storage_path column and remove dependency on full URLs

-- Add storage_path column if it doesn't exist
ALTER TABLE photos ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Update existing records: extract filename from url if needed
-- This assumes your current URLs end with the filename
UPDATE photos 
SET storage_path = SUBSTRING(url FROM '[^/]+$')
WHERE storage_path IS NULL AND url IS NOT NULL;

-- Make storage_path the primary way to reference images
-- You can optionally drop the url column later after migration
-- ALTER TABLE photos DROP COLUMN url;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_photos_storage_path ON photos(storage_path);