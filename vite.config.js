import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset URLs support GitHub Pages project paths and Netlify.
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true
  }
});
