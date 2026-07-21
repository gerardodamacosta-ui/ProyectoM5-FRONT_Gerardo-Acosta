import { formatPrice } from '@/shared/utils/formatters'
import type { OrderItem } from '@/modules/orders/types/order.types'

// resumen de una orden: items (snapshot inmutable, sin join contra products) + total.
// no reutiliza CartSummary/CartItem del módulo cart: acá las filas son de solo lectura
// (sin cantidad editable ni botón eliminar), forzar esa reutilización solo sumaría props
// condicionales a un componente que hoy es simple
interface OrderSummaryProps {
  items: OrderItem[]
  total: number
}

export function OrderSummary({ items, total }: OrderSummaryProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex items-center justify-between text-sm sm:text-base"
          >
            <span className="text-gray-700">
              {item.quantity} × {item.name}
            </span>
            <span className="font-semibold text-gray-900">
              {formatPrice(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-gray-200 pt-3">
        <span className="text-sm font-medium text-gray-600 sm:text-base">Total</span>
        <span className="text-xl font-bold text-gray-900 sm:text-2xl">{formatPrice(total)}</span>
      </div>
    </div>
  )
}
