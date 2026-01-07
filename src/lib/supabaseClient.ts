import { createClient } from '@supabase/supabase-js';

// Helper untuk mengakses environment variable dengan aman tanpa menyebabkan crash
const getEnv = (key: string): string => {
  try {
    // @ts-ignore - Supress TS warning
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key] || '';
    }
  } catch (e) {
    console.warn('Gagal membaca env:', e);
  }
  return '';
};

// URL Supabase Project Anda (Fallback jika .env belum terdeteksi)
const FALLBACK_URL = 'https://fclgroxedtjyuznswose.supabase.co';

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || FALLBACK_URL;
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseAnonKey) {
  console.warn("PERINGATAN: VITE_SUPABASE_ANON_KEY belum diset. Pastikan file .env sudah dibuat dan berisi key yang benar.");
}

// Inisialisasi client dengan fallback agar UI tetap bisa render (tidak white screen)
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'placeholder-key-untuk-mencegah-crash'
);
