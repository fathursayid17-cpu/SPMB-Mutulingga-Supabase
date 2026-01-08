import { createClient } from '@supabase/supabase-js';

// Fallback values untuk memastikan aplikasi jalan meski tanpa .env di CodeSandbox/StackBlitz
const FALLBACK_URL = 'https://fclgroxedtjyuznswose.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub24iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc2NzY3NTQ1NiwiZXhwIjoyMDgzMjUxNDU2fQ.8RYVxGbbjVphbyMdQvpGQd3PNhXuRdlVZCXsTdDgvRQ'; // Token ini harusnya valid JWT, saya pakai placeholder structure yang valid jika key asli anda expired, tapi disini saya restore key dari file sebelumnya yang anda kirim.

// Restore key asli dari file yang anda berikan sebelumnya
const REAL_FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbGdyb3hlZHRqeXV6bnN3b3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzU0NTYsImV4cCI6MjA4MzI1MTQ1Nn0.8RYVxGbbjVphbyMdQvpGQd3PNhXuRdlVZCXsTdDgvRQ';

// Helper to access env vars safely
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[key];
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env) {
    // @ts-ignore
    return process.env[key];
  }
  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || FALLBACK_URL;
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || REAL_FALLBACK_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);