// Manually define ImportMetaEnv to support import.meta.env usage
// This replaces the need for <reference types="vite/client" /> which was failing to resolve
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Augment NodeJS.ProcessEnv to include API_KEY.
// This supports usage of process.env.API_KEY in the code without redeclaring 'process'.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string | undefined;
    [key: string]: string | undefined;
  }
}
