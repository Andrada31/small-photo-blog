-- Add RLS policy to allow inserts (for admin uploads)
-- Since we're using a simple admin auth, we allow all inserts
-- In production, you'd want to restrict this to authenticated admin users

ALTER POLICY "Allow public read access to photos" ON photos USING (true);

-- Allow inserts for all (protected by application-level auth)
CREATE POLICY "Allow insert for all" ON photos
  FOR INSERT
  WITH CHECK (true);

-- Allow updates for all (protected by application-level auth)
CREATE POLICY "Allow update for all" ON photos
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow deletes for all (protected by application-level auth)
CREATE POLICY "Allow delete for all" ON photos
  FOR DELETE
  USING (true);
