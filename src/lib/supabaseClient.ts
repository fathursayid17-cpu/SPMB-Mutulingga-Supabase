import { createClient } from '@supabase/supabase-js';

// --- KONFIGURASI MANUAL (FALLBACK) ---
// Data ini digunakan jika file .env tidak terbaca (misal di localhost)
const FALLBACK_URL = 'https://fovlxmonkvdgfukbsxxm.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdmx4bW9ua3ZkZ2Z1a2JzeHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NzgxNTgsImV4cCI6MjA4MzQ1NDE1OH0.UZh_5xoY6-8R0m5F80yT1gin-u2EC8ncuJmIgXCpRwk';

// Helper untuk membaca env vars dengan aman
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return null;
};

// Logika pemilihan URL & Key:
// 1. Coba ambil dari Environment Variable (Vite/Vercel)
// 2. Jika kosong, gunakan FALLBACK hardcoded di atas
const supabaseUrl = getEnv('VITE_SUPABASE_URL') || FALLBACK_URL;
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || FALLBACK_KEY;

// Validasi sederhana untuk debugging
if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
  console.warn('Warning: Menggunakan URL Supabase placeholder atau kosong.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);