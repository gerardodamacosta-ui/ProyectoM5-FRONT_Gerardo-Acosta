import { createContext, useCallback, useEffect, useReducer, useRef } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { AppError } from '@/shared/types/error.types'
import * as authApi from '@/modules/auth/services/auth.api'
import type { AuthState, LoginFormData, RegisterFormData } from '@/modules/auth/types/auth.types'
import type { User } from '@/modules/auth/types/user.types'
import { authReducer, initialAuthState } from './authReducer'

// lo que expone el contexto: el estado global de auth + sus acciones
interface AuthContextValue extends AuthState {
  loginWithEmail: (formData: LoginFormData) => Promise<void>
  loginWithGoogle: () => Promise<void>
  registerWithEmail: (formData: RegisterFormData) => Promise<void>
  logout: () => Promise<void>
}

// null fuera del provider — useAuth lo detecta y falla con mensaje claro
export const AuthContext = createContext<AuthContextValue | null>(null)

// mensaje apto para UI: AppError ya viene legible desde los servicios; el resto cae al genérico
function getErrorMessage(error: unknown): string {
  return error instanceof AppError ? error.message : 'Ocurrió un error inesperado.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState)

  // flag (ref, no estado): hay un login/registro en vuelo → el listener no debe pisar su resultado
  const operationInFlight = useRef(false)

  // espejo del user actual, para leerlo dentro del listener sin re-suscribirlo en cada cambio
  const userRef = useRef<User | null>(null)
  useEffect(() => {
    userRef.current = state.user
  }, [state.user])

  // listener de sesión de Firebase: restaura la sesión persistida y reacciona a login/logout
  // vive acá y no en useAuth: es infraestructura del provider, se suscribe UNA sola vez
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // sin usuario de Firebase → sesión cerrada
      if (!firebaseUser) {
        dispatch({ type: 'AUTH_LOGOUT' })
        return
      }
      // con usuario → se busca el perfil en users/{uid} para conocer el role
      authApi
        .getUserDoc(firebaseUser.uid)
        .then((user) => {
          if (user) {
            dispatch({ type: 'AUTH_SUCCESS', payload: user })
            return
          }
          // doc inexistente: solo se despacha logout si NO hay operación en vuelo
          // y NO hay un usuario ya logueado — el listener jamás pisa un login/registro
          // en curso (el resultado final lo despacha la propia operación) ni desloguea
          // a alguien por una lectura que llegó tarde
          if (!operationInFlight.current && !userRef.current) {
            dispatch({ type: 'AUTH_LOGOUT' })
          }
        })
        .catch((error: unknown) => {
          // nunca silencioso: si falla la lectura del perfil, el error llega a la UI
          dispatch({ type: 'AUTH_ERROR', payload: getErrorMessage(error) })
        })
    })
    // limpieza: desuscribe el listener al desmontar el provider
    return unsubscribe
  }, [])

  // patrón común de login/registro: loading → servicio → success/error,
  // marcando operationInFlight para que el listener no interfiera (ver useEffect de arriba)
  const runAuthOperation = useCallback(async (operation: () => Promise<User>) => {
    operationInFlight.current = true
    dispatch({ type: 'AUTH_LOADING' })
    try {
      const user = await operation()
      dispatch({ type: 'AUTH_SUCCESS', payload: user })
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: getErrorMessage(error) })
    } finally {
      operationInFlight.current = false
    }
  }, [])

  // login con email/password
  const loginWithEmail = useCallback(
    (formData: LoginFormData) => runAuthOperation(() => authApi.loginWithEmail(formData)),
    [runAuthOperation]
  )

  // login con Google (popup)
  const loginWithGoogle = useCallback(
    () => runAuthOperation(() => authApi.loginWithGoogle()),
    [runAuthOperation]
  )

  // registro con email/password (crea cuenta + perfil con role customer)
  const registerWithEmail = useCallback(
    (formData: RegisterFormData) => runAuthOperation(() => authApi.registerWithEmail(formData)),
    [runAuthOperation]
  )

  // cierre de sesión — se despacha acá mismo para que la UI reaccione al instante
  // (el listener también lo detecta, pero despachar dos veces AUTH_LOGOUT es inocuo)
  const logout = useCallback(async () => {
    try {
      await authApi.logout()
      dispatch({ type: 'AUTH_LOGOUT' })
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: getErrorMessage(error) })
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ ...state, loginWithEmail, loginWithGoogle, registerWithEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
