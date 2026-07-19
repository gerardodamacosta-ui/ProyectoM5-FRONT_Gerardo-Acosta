import { Link, Navigate } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import { LoadingState } from '@/shared/components/ui/states/LoadingState'
import { GoogleButton } from '@/modules/auth/components/GoogleButton'
import { LoginForm } from '@/modules/auth/components/LoginForm'
import { useAuth } from '@/modules/auth/hooks/useAuth'

export function LoginPage() {
  const { user, loading } = useAuth()

  // Firebase todavía resuelve si hay sesión persistida — no mostrar el form de más
  if (loading && !user) return <LoadingState text="Verificando tu sesión..." />

  // con sesión activa el login no tiene sentido → al home (cubre también el post-login)
  if (user) return <Navigate to={ROUTES.home} replace />

  return (
    // mobile first: card al ancho completo, acotada con max-w desde sm:
    <main className="flex min-h-screen items-center justify-center bg-brand-50 p-4">
      <section className="w-full max-w-md rounded-xl bg-white p-6 shadow-md sm:p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-brand-700 sm:text-3xl">
          Iniciar sesión
        </h1>

        <LoginForm />

        {/* separador visual entre el login con email y el de Google */}
        <div className="my-4 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">o</span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <GoogleButton />

        {/* acceso al registro para quien no tiene cuenta */}
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tenés cuenta?{' '}
          <Link to={ROUTES.register} className="font-medium text-brand-600 hover:underline">
            Registrate
          </Link>
        </p>
      </section>
    </main>
  )
}
