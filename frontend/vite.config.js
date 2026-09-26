import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// When VITE_BACKEND_URL is set (production), no proxy is needed —
// the frontend talks directly to the backend URL.
// In local dev (no env var), proxy /api and /socket.io to localhost:5002.
const backendUrl = process.env.VITE_BACKEND_URL || 'http://127.0.0.1:5002';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
      },
      '/socket.io': {
        target: backendUrl,
        ws: true,
      },
    },
  },
});
