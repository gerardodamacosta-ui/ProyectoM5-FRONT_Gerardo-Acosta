import type { User } from './user.types'

// estado global de autenticación — loading arranca en true porque Firebase
// tarda en resolver si hay sesión persistida (evita parpadeo a "no logueado")
export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// acciones del authReducer — discriminated union: cada acción declara solo el payload que necesita
export type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }

// datos que completa el usuario en el form de login
export interface LoginFormData {
  email: string
  password: string
}

// datos que completa el usuario en el form de registro
export interface RegisterFormData {
  displayName: string
  email: string
  password: string
}
