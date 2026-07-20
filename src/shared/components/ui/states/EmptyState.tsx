// cara "empty" del patrón loading/error/empty — sin datos, pero sin error (ej. catálogo
// vacío, o un filtro/búsqueda que no encontró resultados)
interface EmptyStateProps {
  text: string
}

export function EmptyState({ text }: EmptyStateProps) {
  return (
    // mobile first: centrado con altura mínima para que el layout no colapse
    <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 p-4 text-center">
      <p className="text-2xl" aria-hidden="true">
        🔍
      </p>
      <p className="text-sm text-gray-600 sm:text-base">{text}</p>
    </div>
  )
}
