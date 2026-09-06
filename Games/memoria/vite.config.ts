import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    // shared/ mora fora da raiz deste projeto; sem isso o dev server recusa
    // servir base.css e sons.js.
    fs: { allow: [path.resolve(__dirname, '../..')] },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
