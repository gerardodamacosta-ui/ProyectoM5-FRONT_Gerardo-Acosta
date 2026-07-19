import type { AuthAction, AuthState } from '@/modules/auth/types/auth.types'

// estado inicial: loading en true porque Firebase todavía no resolvió si hay sesión persistida
export const initialAuthState: AuthState = {
  user: null,
  loading: true,
  error: null,
}

// reducer puro: cada acción produce un estado nuevo y predecible (fácil de testear aislado)
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    // arranca una operación de auth: se limpia el error anterior
    case 'AUTH_LOADING':
      return { ...state, loading: true, error: null }
    // sesión activa con perfil resuelto
    case 'AUTH_SUCCESS':
      return { user: action.payload, loading: false, error: null }
    // falló una operación: el mensaje ya viene legible desde la capa de servicios
    case 'AUTH_ERROR':
      return { ...state, loading: false, error: action.payload }
    // sesión cerrada (logout o Firebase resolvió que no había sesión)
    case 'AUTH_LOGOUT':
      return { user: null, loading: false, error: null }
  }
}
