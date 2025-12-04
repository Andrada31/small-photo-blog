-- Create storage bucket for photos
-- Note: This needs to be run via Supabase dashboard or API
-- as storage bucket creation requires admin privileges

-- After creating the bucket named 'photos' in Supabase Storage,
-- set these policies:

-- 1. Allow public read access to photos bucket
-- INSERT INTO storage.policies (name, bucket_id, definition)
-- VALUES (
--   'Public Read Access',
--   'photos',
--   '{"role": "anon", "operation": "SELECT"}'
-- );

-- For now, photos will be stored with public URLs
-- You can upload images via the Supabase dashboard Storage section
-- or programmatically using the Supabase client
