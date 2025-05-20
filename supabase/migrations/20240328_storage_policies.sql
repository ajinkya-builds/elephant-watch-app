-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('elephant-watch', 'elephant-watch', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations for service role
CREATE POLICY "Allow service role full access"
ON storage.objects
FOR ALL
USING (true)
WITH CHECK (true);

-- Make the bucket public for reading
UPDATE storage.buckets
SET public = true
WHERE id = 'elephant-watch';

-- Grant usage on storage schema
GRANT USAGE ON SCHEMA storage TO service_role;

-- Grant all on storage.objects to service role
GRANT ALL ON storage.objects TO service_role;

-- Grant all on storage.buckets to service role
GRANT ALL ON storage.buckets TO service_role; 