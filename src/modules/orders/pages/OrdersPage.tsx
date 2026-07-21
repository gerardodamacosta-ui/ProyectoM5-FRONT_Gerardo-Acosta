import { LoadingState } from '@/shared/components/ui/states/LoadingState'
import { ErrorState } from '@/shared/components/ui/states/ErrorState'
import { EmptyState } from '@/shared/components/ui/states/EmptyState'
import { OrderCard } from '@/modules/orders/components/OrderCard'
import { useOrders } from '@/modules/orders/hooks/useOrders'

export function OrdersPage() {
  const { data: orders, loading, error } = useOrders()

  if (loading) return <LoadingState text="Cargando tus órdenes..." />
  if (error) return <ErrorState message={error} />
  if (!orders?.length) return <EmptyState text="Todavía no hiciste ninguna compra." />

  return (
    // mobile first: columna única, ancho máximo para que no se estire demasiado en desktop
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <h1 className="text-2xl font-bold text-brand-700 sm:text-3xl">Mis órdenes</h1>

      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </main>
  )
}
