-- Enable RLS on tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON members;
DROP POLICY IF EXISTS "Allow public insert access" ON members;
DROP POLICY IF EXISTS "Allow public update access" ON members;
DROP POLICY IF EXISTS "Allow public delete access" ON members;

DROP POLICY IF EXISTS "Allow public read access" ON system_settings;
DROP POLICY IF EXISTS "Allow public insert access" ON system_settings;
DROP POLICY IF EXISTS "Allow public update access" ON system_settings;
DROP POLICY IF EXISTS "Allow public delete access" ON system_settings;

-- Create permissive policies for members table
CREATE POLICY "Allow public read access" ON members
FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON members
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON members
FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON members
FOR DELETE USING (true);

-- Create permissive policies for system_settings table
CREATE POLICY "Allow public read access" ON system_settings
FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON system_settings
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON system_settings
FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON system_settings
FOR DELETE USING (true);

-- Grant permissions to anon role
GRANT ALL ON members TO anon;
GRANT ALL ON system_settings TO anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant permissions to authenticated role
GRANT ALL ON members TO authenticated;
GRANT ALL ON system_settings TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
