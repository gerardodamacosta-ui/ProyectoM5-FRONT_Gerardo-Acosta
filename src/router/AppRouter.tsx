import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ROUTES } from '../config/constants'

// placeholder temporal del home hasta que exista el catálogo real
function HomePlaceholder() {
  return (
    // mobile first: clases base sin prefijo, escala con sm:/md:/lg:
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-brand-50 p-4">
      <h1 className="text-2xl font-bold text-brand-700 sm:text-3xl">
        Patagonix Tech
      </h1>
      <p className="text-sm text-gray-600 sm:text-base">
        Scaffold inicial — Vite + React 18 + TypeScript + Tailwind
      </p>
    </main>
  )
}

// enrutador central de la app — las rutas reales se agregan a medida que cada módulo tenga sus páginas
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.home} element={<HomePlaceholder />} />
      </Routes>
    </BrowserRouter>
  )
}
