import { AppError } from '@/shared/types/error.types'

// mensaje genérico para errores que no tienen mapeo específico
const DEFAULT_MESSAGE = 'Ocurrió un error inesperado. Intentá de nuevo en unos minutos.'

// manejo centralizado de errores de la capa de servicios (*.api.ts):
// loggea con contexto y relanza como AppError — nunca un catch vacío ni un error silencioso
export function handleServiceError(
  error: unknown,
  context: string,
  friendlyMessage?: string
): never {
  // log con contexto para poder rastrear el origen (ej. [auth.loginWithEmail])
  console.error(`[${context}]`, error)

  // si ya viene manejado de más abajo, se propaga tal cual (no se re-envuelve)
  if (error instanceof AppError) throw error

  // se relanza con mensaje legible para la UI (el específico si existe, si no el genérico)
  throw new AppError(friendlyMessage ?? DEFAULT_MESSAGE, context)
}
