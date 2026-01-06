
import { createClient } from '@supabase/supabase-js';

// Helper untuk menangani environment variable dengan aman (mencegah crash jika undefined)
const getEnv = (key: string) => {
  // Gunakan optional chaining (?.) agar tidak error jika import.meta.env undefined
  return import.meta.env?.[key] || '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL atau Anon Key belum disetting di .env. Fitur database mungkin tidak berfungsi.");
}

// Gunakan fallback URL agar createClient tidak crash saat inisialisasi awal (UI tetap muncul)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
