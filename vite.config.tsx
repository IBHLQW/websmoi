import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // GitHub Pages deployment fix: use relative paths
  plugins: [react(), tailwindcss()],
});
