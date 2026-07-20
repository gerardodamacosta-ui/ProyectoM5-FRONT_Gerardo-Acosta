// cara "error" del patrón loading/error/empty — muestra siempre el mensaje real
// (nunca "algo salió mal" genérico: el mensaje ya viene legible desde la capa de servicios)
interface ErrorStateProps {
  message: string
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    // mobile first: centrado con altura mínima para que el layout no colapse
    // role="alert": se anuncia solo al aparecer, mismo criterio que el error de Input
    <div
      role="alert"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-4 text-center"
    >
      <p className="text-2xl" aria-hidden="true">
        ⚠️
      </p>
      <p className="text-sm text-red-700 sm:text-base">{message}</p>
    </div>
  )
}
