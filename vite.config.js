import { defineConfig } from 'vite';

const apiTarget = process.env.VITE_API_PROXY ?? 'http://localhost:3000';

export default defineConfig({
  root: 'web',
  publicDir: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    // Keep fonts and images as files so the strict CSP (font-src 'self') applies cleanly.
    assetsInlineLimit: 0,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': apiTarget,
    },
  },
});
