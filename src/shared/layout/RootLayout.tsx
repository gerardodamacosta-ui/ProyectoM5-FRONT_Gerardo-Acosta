import { Link, Outlet } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import { CartIcon } from '@/modules/cart/components/CartIcon'

// layout compartido del cliente: header con CartIcon + outlet para la página activa
// nota de arquitectura: shared/ importando un componente de un módulo de dominio (cart)
// rompe en teoría la dirección de dependencias, pero es un solo ícono — no amerita
// una prop de slot/children para este tamaño de proyecto
export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <Link to={ROUTES.home} className="text-lg font-bold text-brand-700">
          Patagonix Tech
        </Link>
        <CartIcon />
      </header>
      <Outlet />
    </div>
  )
}
