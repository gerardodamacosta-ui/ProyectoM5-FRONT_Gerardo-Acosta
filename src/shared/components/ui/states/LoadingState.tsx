// cara "loading" del patrón loading/error/empty — presentacional puro, reutilizable en toda la app
// (ErrorState y EmptyState se agregan acá mismo cuando el primer consumidor los necesite)
interface LoadingStateProps {
  // texto opcional bajo el spinner
  text?: string
}

export function LoadingState({ text = 'Cargando...' }: LoadingStateProps) {
  return (
    // mobile first: centrado con altura mínima para que el layout no colapse mientras carga
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-4">
      {/* spinner: círculo con borde de marca y animación de Tailwind */}
      <span
        className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"
        role="status"
        aria-label="Cargando"
      />
      <p className="text-sm text-gray-600 sm:text-base">{text}</p>
    </div>
  )
}
