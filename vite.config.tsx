import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), '')

  return {
    base: "/websmoi/",

    plugins: [
      react(),
      tailwindcss()
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.')
      }
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true'
    }
  }
})