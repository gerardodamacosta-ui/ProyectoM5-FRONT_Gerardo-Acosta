// roles posibles de la app — la validación real también vive en Firestore Security Rules
export type UserRole = 'customer' | 'admin'

// contrato de forma del usuario (doc en users/{uid}) — los datos reales viven en Firestore
export interface User {
  uid: string
  email: string
  displayName: string
  role: UserRole
  photoURL?: string
  // fecha de alta en ISO — auth.api.ts la escribe ya como string al crear el doc
  // (sin Timestamp de Firestore; si migráramos a serverTimestamp, la conversión iría en mapToUser)
  createdAt: string
}
