import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables")
}

// Create client with proper configuration
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "x-my-custom-header": "youth-center-app",
    },
  },
})

export type Member = {
  id: string
  member_id: string
  first_name: string
  last_name: string
  birth_date: string
  birth_place_wilaya: string
  birth_place_commune: string
  phone: string
  gender: "male" | "female"
  education_level: string
  membership_card_number: string
  is_minor: boolean
  guardian_first_name?: string
  guardian_last_name?: string
  guardian_national_id?: string
  guardian_phone?: string
  guardian_relation?: string
  selected_space: string
  selected_club: string
  selected_activity: string
  payment_confirmed: boolean
  registration_date: string
  birth_certificate_url?: string
  photo_url?: string
  parental_consent_url?: string
  medical_certificate_url?: string
  created_at: string
  updated_at: string
}

export type SystemSetting = {
  id: string
  setting_key: string
  setting_value: string
  updated_at: string
}
