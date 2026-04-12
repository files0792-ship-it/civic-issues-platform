import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Vite dev server proxies /api and /uploads to the Express backend */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
