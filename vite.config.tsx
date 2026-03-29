import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/websmoi/', // Update this to match your repository name exactly
  plugins: [react(), tailwindcss()],
});
