import type { Order } from '@/modules/orders/types/order.types'

// mapeo de UI: estado de la orden → clases de badge y etiqueta — única fuente de verdad,
// mismo criterio que el mapeo de variantes en Button
const STATUS_CLASSES: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

// exportado: lo reusa el <select> de estado en AdminOrdersPage, no se duplica el mapeo
export const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

interface OrderStatusBadgeProps {
  status: Order['status']
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
