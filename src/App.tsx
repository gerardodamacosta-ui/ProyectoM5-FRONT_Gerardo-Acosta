// componente raíz — placeholder hasta montar el router en pasos siguientes
function App() {
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

export default App
