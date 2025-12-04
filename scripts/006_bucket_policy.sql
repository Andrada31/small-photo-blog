-- Enable storage policies for the 'photos' bucket
-- Run this in Supabase SQL Editor

-- First, create the bucket if it doesn't exist (do this via Supabase Dashboard)
-- Go to Storage > Create new bucket > Name: "photos" > Make it PUBLIC

-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

-- Allow uploads (for admin functionality)
CREATE POLICY "Allow uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photos');

-- Allow deletions (for admin functionality)
CREATE POLICY "Allow deletions"
ON storage.objects FOR DELETE
USING (bucket_id = 'photos');

-- Allow updates (for admin functionality)
CREATE POLICY "Allow updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'photos');