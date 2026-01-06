
import { createClient } from '@supabase/supabase-js';

// Mengambil variabel environment dari Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL atau Anon Key belum disetting di .env. Fitur database mungkin tidak berfungsi.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
