import { useMemo, useState } from 'react'
import { ORDER_STATUSES } from '@/config/constants'
import { AdminCard } from '@/modules/admin/components/AdminCard'
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

// 'all' no es un estado real: representa "sin filtro" en la UI, mismo criterio que
// CategoryFilterValue del catálogo (Hito 3)
type StatusFilterValue = OrderStatus | 'all'

export function AdminOrdersPage() {
  const { data: orders, loading, error, refetch } = useAllOrders()
  // id de la orden que se está actualizando ahora mismo — deshabilita solo ese select
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all')

  // filtrado 100% client-side sobre las órdenes ya traídas por getAllOrders — sin query
  // nueva a Firestore, mismo patrón que el filtro de categoría en CatalogPage
  const filteredOrders = useMemo(() => {
    if (!orders) return []
    if (statusFilter === 'all') return orders
    return orders.filter((order) => order.status === statusFilter)
  }, [orders, statusFilter])

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

  // dos mensajes de "vacío" distintos: sin órdenes en absoluto vs. filtro sin resultados
  // (mismo criterio que CatalogPage para categoría/búsqueda)
  const emptyMessage =
    orders && orders.length === 0
      ? 'Todavía no hay órdenes.'
      : statusFilter !== 'all'
        ? 'No encontramos órdenes con ese estado.'
        : 'Todavía no hay órdenes.'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Órdenes</h2>
        {/* filtro por estado, client-side sobre las órdenes ya traídas — bg-white explícito:
            a diferencia del select de fila (vive dentro de AdminCard), este está afuera,
            directo sobre el fondo oscuro de AdminLayout, y el preflight deja el <select>
            sin fondo propio (transparente), no solo sin color de texto */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilterValue)}
          aria-label="Filtrar por estado"
          className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
        >
          <option value="all">Todos</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <AdminCard>
        {loading && <LoadingState text="Cargando órdenes..." />}
        {error && <ErrorState message={error} />}
        {updateError && <ErrorState message={updateError} />}
        {!loading && !error && filteredOrders.length === 0 && <EmptyState text={emptyMessage} />}
        {!loading && !error && filteredOrders.length > 0 && (
          <ul className="flex flex-col">
            {filteredOrders.map((order) => (
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
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60"
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
      </AdminCard>
    </div>
  )
}
