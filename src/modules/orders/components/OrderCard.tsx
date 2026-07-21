import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import { formatDate, formatPrice } from '@/shared/utils/formatters'
import type { Order } from '@/modules/orders/types/order.types'

// mapeo de UI: estado de la orden → clases de badge y etiqueta — única fuente de verdad,
// mismo criterio que el mapeo de variantes en Button
const STATUS_CLASSES: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link
      to={ROUTES.orderDetail.replace(':id', order.id)}
      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col gap-1">
        {/* id corto: primeros 8 caracteres, alcanza para diferenciar órdenes a simple vista */}
        <span className="text-xs text-gray-500">#{order.id.slice(0, 8)}</span>
        <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm font-bold text-gray-900 sm:text-base">
          {formatPrice(order.total)}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[order.status]}`}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>
    </Link>
  )
}
