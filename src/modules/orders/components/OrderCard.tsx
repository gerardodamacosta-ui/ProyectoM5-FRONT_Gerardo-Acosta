import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import { formatDate, formatPrice } from '@/shared/utils/formatters'
import { OrderStatusBadge } from '@/modules/orders/components/OrderStatusBadge'
import type { Order } from '@/modules/orders/types/order.types'

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
        <OrderStatusBadge status={order.status} />
      </div>
    </Link>
  )
}
