import { Link, Outlet, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { CartIcon } from '@/modules/cart/components/CartIcon'

// layout compartido del cliente: header con nav + CartIcon + outlet para la página activa
// nota de arquitectura: shared/ importando componentes de módulos de dominio (auth, cart)
// rompe en teoría la dirección de dependencias, pero son piezas chicas — no amerita
// una prop de slot/children para este tamaño de proyecto
export function RootLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    // mismo orden que AdminLayout: navigate ANTES de logout — evita el race con
    // ProtectedRoute cuando el logout se dispara desde una ruta protegida (ej. /orders)
    navigate(ROUTES.home)
    await logout()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <Link to={ROUTES.home} className="text-lg font-bold text-brand-700">
          Patagonix Tech
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link to={ROUTES.catalog} className="text-gray-700 hover:text-brand-600">
              Catálogo
            </Link>
            {/* Mis órdenes solo tiene sentido con sesión activa, mismo criterio que CartIcon */}
            {user && (
              <Link to={ROUTES.orders} className="text-gray-700 hover:text-brand-600">
                Mis órdenes
              </Link>
            )}
            {/* Panel Admin: mismo criterio que Mis órdenes, sumando el chequeo de rol —
                solo el link visible, sin redirect automático post-login (fuera de alcance) */}
            {user && user.role === 'admin' && (
              <Link to={ROUTES.admin} className="text-gray-700 hover:text-brand-600">
                Panel Admin
              </Link>
            )}
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                Salir
              </button>
            ) : (
              <Link to={ROUTES.login} className="text-gray-700 hover:text-brand-600">
                Login
              </Link>
            )}
          </nav>
          <CartIcon />
        </div>
      </header>
      <Outlet />
    </div>
  )
}
