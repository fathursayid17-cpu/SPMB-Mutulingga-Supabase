import { createClient } from '@supabase/supabase-js';

// Fallback values from user context
const FALLBACK_URL = 'https://fclgroxedtjyuznswose.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbGdyb3hlZHRqeXV6bnN3b3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzU0NTYsImV4cCI6MjA4MzI1MTQ1Nn0.8RYVxGbbjVphbyMdQvpGQd3PNhXuRdlVZCXsTdDgvRQ';

// Helper to access env vars safely
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || FALLBACK_URL;
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || FALLBACK_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
