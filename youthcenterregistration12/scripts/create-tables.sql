-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_place_wilaya TEXT NOT NULL,
  birth_place_commune TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  education_level TEXT NOT NULL,
  membership_card_number TEXT UNIQUE NOT NULL,
  is_minor BOOLEAN DEFAULT FALSE,
  guardian_first_name TEXT,
  guardian_last_name TEXT,
  guardian_national_id TEXT,
  guardian_phone TEXT,
  guardian_relation TEXT,
  selected_space TEXT NOT NULL,
  selected_club TEXT NOT NULL,
  selected_activity TEXT NOT NULL,
  payment_confirmed BOOLEAN DEFAULT FALSE,
  registration_date TIMESTAMP DEFAULT NOW(),
  birth_certificate_url TEXT,
  photo_url TEXT,
  parental_consent_url TEXT,
  medical_certificate_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value) VALUES
  ('member_id_counter', '1'),
  ('current_season', '2425'),
  ('card_number_start', '1'),
  ('card_number_end', '1000'),
  ('current_card_number', '1')
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_member_id ON members(member_id);
CREATE INDEX IF NOT EXISTS idx_members_registration_date ON members(registration_date);
CREATE INDEX IF NOT EXISTS idx_members_activity ON members(selected_activity);
CREATE INDEX IF NOT EXISTS idx_members_space ON members(selected_space);
