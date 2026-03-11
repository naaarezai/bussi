import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase-yhteyden asetukset (URL tai ANON KEY) puuttuvat .env.local -tiedostosta.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
