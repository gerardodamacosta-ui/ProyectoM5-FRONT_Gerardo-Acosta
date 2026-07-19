import { Navigate, Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ROUTES } from '@/config/constants'
import { LoadingState } from '@/shared/components/ui/states/LoadingState'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import type { UserRole } from '@/modules/auth/types/user.types'

// protege rutas por sesión y por rol — vive en modules/auth porque conoce
// lógica de negocio (roles), mismo criterio que CartContext (ver CLAUDE.md)
interface ProtectedRouteProps {
  // roles habilitados para entrar (ej. ['admin'] para el panel)
  allowedRoles: UserRole[]
  // children opcional: se puede usar envolviendo un elemento o como ruta padre con Outlet
  children?: ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  // Firebase todavía está resolviendo la sesión persistida: mostrar loading, no redirigir de más
  if (loading) return <LoadingState text="Verificando tu sesión..." />

  // sin sesión → al login
  if (!user) return <Navigate to={ROUTES.login} replace />

  // logueado pero sin el rol necesario → al home (no hay nada que ver acá)
  if (!allowedRoles.includes(user.role)) return <Navigate to={ROUTES.home} replace />

  // autorizado: renderiza el contenido directo o las rutas anidadas
  return <>{children ?? <Outlet />}</>
}
