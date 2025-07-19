-- Update storage bucket to be public
UPDATE storage.buckets SET public = true WHERE id = 'documents';

-- Drop existing policies (both authenticated and public ones this script might have created previously)
DROP POLICY IF EXISTS "Allow authenticated users to upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from documents bucket" ON storage.objects;

-- Create public access policies
CREATE POLICY "Allow public upload to documents bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public read from documents bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Allow public delete from documents bucket" ON storage.objects
FOR DELETE USING (bucket_id = 'documents');

-- Make members table publicly accessible
DROP POLICY IF EXISTS "Enable read access for all users" ON members;
DROP POLICY IF EXISTS "Enable insert for all users" ON members;
DROP POLICY IF EXISTS "Enable update for all users" ON members;

CREATE POLICY "Enable read access for all users" ON members FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON members FOR UPDATE USING (true);

-- Make system_settings table publicly accessible
DROP POLICY IF EXISTS "Enable read access for all users" ON system_settings;
DROP POLICY IF EXISTS "Enable insert for all users" ON system_settings;
DROP POLICY IF EXISTS "Enable update for all users" ON system_settings;

CREATE POLICY "Enable read access for all users" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON system_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON system_settings FOR UPDATE USING (true);
