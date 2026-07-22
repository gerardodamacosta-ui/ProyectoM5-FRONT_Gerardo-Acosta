import { useState } from 'react'
import { ORDER_STATUSES } from '@/config/constants'
import { LoadingState } from '@/shared/components/ui/states/LoadingState'
import { ErrorState } from '@/shared/components/ui/states/ErrorState'
import { EmptyState } from '@/shared/components/ui/states/EmptyState'
import { AppError } from '@/shared/types/error.types'
import { formatDate, formatPrice } from '@/shared/utils/formatters'
import { STATUS_LABELS } from '@/modules/orders/components/OrderStatusBadge'
import { useAllOrders } from '@/modules/orders/hooks/useAllOrders'
import { updateOrderStatus } from '@/modules/orders/services/orders.api'
import type { Order, OrderStatus } from '@/modules/orders/types/order.types'

// mensaje apto para UI: AppError ya viene legible desde los servicios; el resto cae al genérico
function getErrorMessage(error: unknown): string {
  return error instanceof AppError ? error.message : 'Ocurrió un error inesperado.'
}

export function AdminOrdersPage() {
  const { data: orders, loading, error, refetch } = useAllOrders()
  // id de la orden que se está actualizando ahora mismo — deshabilita solo ese select
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const handleStatusChange = async (order: Order, status: OrderStatus) => {
    setUpdatingId(order.id)
    setUpdateError(null)
    try {
      await updateOrderStatus(order.id, status)
      // refetch en vez de estado admin paralelo: la lista se resincroniza con Firestore
      refetch()
    } catch (err) {
      setUpdateError(getErrorMessage(err))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Órdenes</h2>

      {/* card blanca: mismo motivo que en las páginas de productos admin */}
      <div className="rounded-xl bg-white p-4 sm:p-6">
        {loading && <LoadingState text="Cargando órdenes..." />}
        {error && <ErrorState message={error} />}
        {updateError && <ErrorState message={updateError} />}
        {!loading && !error && (!orders || orders.length === 0) && (
          <EmptyState text="Todavía no hay órdenes." />
        )}
        {!loading && !error && orders && orders.length > 0 && (
          <ul className="flex flex-col">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center gap-3 border-b border-gray-200 py-3 last:border-b-0"
              >
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</span>
                {/* select inline, mismo criterio que category en ProductForm: sin componente Select nuevo */}
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                  disabled={updatingId === order.id}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
