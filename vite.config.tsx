import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Use relative paths to ensure assets load correctly on GitHub Pages
  plugins: [react(), tailwindcss()],
});
