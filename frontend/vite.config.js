import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server proxies API calls and uploaded posters to the Express backend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // fail loudly if 5173 is taken instead of silently moving to another port
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
});
