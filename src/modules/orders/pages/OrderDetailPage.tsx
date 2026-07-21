import { useParams } from 'react-router-dom'
import { LoadingState } from '@/shared/components/ui/states/LoadingState'
import { ErrorState } from '@/shared/components/ui/states/ErrorState'
import { formatDate } from '@/shared/utils/formatters'
import { OrderStatusBadge } from '@/modules/orders/components/OrderStatusBadge'
import { OrderSummary } from '@/modules/orders/components/OrderSummary'
import { useOrder } from '@/modules/orders/hooks/useOrder'

export function OrderDetailPage() {
  // la ruta es /orders/:id (ver ROUTES.orderDetail) — id siempre viene como string acá
  const { id } = useParams<{ id: string }>()
  const { data: order, loading, error } = useOrder(id ?? '')

  if (loading) return <LoadingState text="Cargando la orden..." />
  if (error) return <ErrorState message={error} />
  // null cubre tanto "no existe" como "no pertenece a este usuario" — la security rule ya
  // deniega el read cruzado antes de llegar acá, pero la UI igual necesita un mensaje
  if (!order) return <ErrorState message="No encontramos esta orden." />

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-brand-700 sm:text-3xl">
          Orden #{order.id.slice(0, 8)}
        </h1>
        <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
        {/* estado visible en el detalle: cambia con el tiempo (hito de admin), acá el cliente
            vuelve a chequear en qué quedó su orden */}
        <OrderStatusBadge status={order.status} />
      </div>

      <OrderSummary items={order.items} total={order.total} />
    </main>
  )
}
