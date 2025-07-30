-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from documents bucket" ON storage.objects;

-- Create more permissive policies for the documents bucket
CREATE POLICY "Allow public upload to documents bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public read from documents bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Allow public delete from documents bucket" ON storage.objects
FOR DELETE USING (bucket_id = 'documents');

-- Make the bucket public
UPDATE storage.buckets SET public = true WHERE id = 'documents';

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
