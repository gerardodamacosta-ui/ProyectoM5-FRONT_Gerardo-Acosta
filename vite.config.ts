import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // plugin oficial de Tailwind para Vite (v4, sin PostCSS manual)
  plugins: [react(), tailwindcss()],
})
