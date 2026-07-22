/// <reference types="vitest/config" />
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
  // config global de Vitest: globals evita reimportar describe/expect/it en cada archivo,
  // jsdom simula el navegador, setupFiles trae jest-dom + el server de MSW
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
