import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// servidor de MSW para el entorno de Node de Vitest — su ciclo de vida se maneja en setup.ts
export const server = setupServer(...handlers)
