import { Link, Outlet, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import { useAuth } from '@/modules/auth/hooks/useAuth'

// layout del panel admin — nav propia, estética distinta del cliente (fondo oscuro
// para diferenciarlo a simple vista, pedido explícito de la consigna)
export function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    // se navega ANTES de deslogear: si se hiciera al revés, ProtectedRoute (montado en /admin
    // en este instante) reacciona al user->null y redirige a /login antes de que este navigate
    // llegue a ejecutarse — cualquier logout dentro de una ruta protegida debe seguir este orden
    navigate(ROUTES.home)
    await logout()
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      <header className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
        <span className="text-lg font-bold">Panel de administración</span>
        <nav className="flex items-center gap-4 text-sm">
          <Link to={ROUTES.admin}>Productos</Link>
          <Link to={ROUTES.adminOrders}>Órdenes</Link>
          {/* navega al home de cliente sin deslogear — si estás en AdminLayout ya sos admin
              logueado por definición de ProtectedRoute, no hace falta ninguna condición */}
          <Link to={ROUTES.home}>Ver tienda</Link>
          <button type="button" onClick={handleLogout} className="text-red-400 hover:text-red-300">
            Salir
          </button>
        </nav>
      </header>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  )
}
