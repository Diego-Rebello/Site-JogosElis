import path from 'path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
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
