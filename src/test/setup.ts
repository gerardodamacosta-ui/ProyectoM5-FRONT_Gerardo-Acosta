import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '@/test/mocks/server'

// intercepta requests HTTP planas durante toda la suite (ver handlers.ts: Firestore/Auth no
// pasan por acá en este entorno, así que 'error' acá no protegería contra eso — la protección
// real para esos casos es mockear *.api.ts/hooks con vi.mock en el test correspondiente)
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
