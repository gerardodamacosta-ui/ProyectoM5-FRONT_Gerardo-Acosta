import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // plugin oficial de Tailwind para Vite (v4, sin PostCSS manual)
  plugins: [react(), tailwindcss()],
  // alias @ → ./src para imports absolutos (espejado en tsconfig.app.json)
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
