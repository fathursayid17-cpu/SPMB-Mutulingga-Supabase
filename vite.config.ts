
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Replace process.env.API_KEY with the actual value during build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    // Prevent generic "process is not defined" crashes if libraries try to access it
    'process.env': {}
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
});
