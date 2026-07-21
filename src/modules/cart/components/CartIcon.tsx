import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { useCart } from '@/modules/cart/hooks/useCart'

// ícono de carrito con badge de cantidad — pensado para el header/nav (todavía no existe
// ese layout compartido en el proyecto; queda listo para engancharse ahí en cuanto exista)
export function CartIcon() {
  const { user } = useAuth()
  const { itemCount } = useCart()

  // sin sesión no tiene sentido mostrarlo: no hay carrito propio al que ir
  if (!user) return null

  return (
    <Link
      to={ROUTES.cart}
      aria-label="Ver carrito"
      className="relative inline-flex items-center p-2 text-2xl"
    >
      <span aria-hidden="true">🛒</span>
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white">
          {itemCount}
        </span>
      )}
    </Link>
  )
}
