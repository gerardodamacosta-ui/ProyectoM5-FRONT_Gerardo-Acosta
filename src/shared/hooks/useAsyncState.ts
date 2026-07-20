import { useEffect, useState } from 'react'
import { AppError } from '@/shared/types/error.types'

// resultado uniforme para cualquier fetch async — evita repetir el useState triple
// (data/loading/error) en cada hook de cada módulo (useProducts, useOrders, etc.)
interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

// mensaje apto para UI: AppError ya viene legible desde los servicios; el resto cae al genérico
function getErrorMessage(error: unknown): string {
  return error instanceof AppError ? error.message : 'Ocurrió un error inesperado.'
}

// ejecuta `asyncFn` cuando cambian las dependencias y devuelve { data, loading, error }
// asyncFn ya viene con sus catch propios (capa de servicios) — acá solo se traduce a estado de UI
export function useAsyncState<T>(asyncFn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null })

  // deps la arma quien llama al hook (ej. useProduct pasa [id]); no hay forma de derivarla
  // acá adentro sin perder el propósito genérico — por eso el warning de exhaustive-deps es esperado
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // evita setState sobre un componente ya desmontado si la respuesta llega tarde
    let cancelled = false
    setState({ data: null, loading: true, error: null })

    asyncFn()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ data: null, loading: false, error: getErrorMessage(error) })
      })

    return () => {
      cancelled = true
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
