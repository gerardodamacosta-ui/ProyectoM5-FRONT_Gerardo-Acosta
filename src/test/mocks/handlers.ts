import type { HttpHandler } from 'msw'

// handlers de MSW para requests HTTP planas (ej. fetch al BFF de S3) — quedan acá listos
// para cuando algún test los necesite. Firestore/Firebase Auth NO pasan por acá: en este
// entorno (Vitest + Node) el SDK de Firebase no usa fetch/XHR/http, así que MSW no llega a
// verlos (confirmado: con handlers vacíos y onUnhandledRequest 'warn', una llamada real a
// getProducts() pegó contra el Firestore de producción sin que MSW la interceptara ni avisara).
// Por eso los tests que tocan Firestore/Auth mockean nuestra propia capa de servicios
// (*.api.ts o hooks) con vi.mock, no el SDK función por función — ver useCart.test.ts.
export const handlers: HttpHandler[] = []
