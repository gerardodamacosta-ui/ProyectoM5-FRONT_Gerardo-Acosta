import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import { Button } from '@/shared/components/ui/Button'
import { LoadingState } from '@/shared/components/ui/states/LoadingState'
import { EmptyState } from '@/shared/components/ui/states/EmptyState'
import { ErrorState } from '@/shared/components/ui/states/ErrorState'
import { AppError } from '@/shared/types/error.types'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { useCart } from '@/modules/cart/hooks/useCart'
import { OrderSummary } from '@/modules/orders/components/OrderSummary'
import { createOrder } from '@/modules/orders/services/orders.api'
import type { OrderItem } from '@/modules/orders/types/order.types'

// mensaje apto para UI: AppError ya viene legible desde los servicios; el resto cae al genérico
function getErrorMessage(error: unknown): string {
  return error instanceof AppError ? error.message : 'Ocurrió un error inesperado.'
}

export function CheckoutPage() {
  const { user } = useAuth()
  const { itemsWithDetails, total, loading, clearCart } = useCart()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) return <LoadingState text="Cargando tu carrito..." />
  if (itemsWithDetails.length === 0) return <EmptyState text="Tu carrito está vacío." />

  // snapshot inmutable armado desde el join que ya hizo useCart (nombre/precio actuales) —
  // nunca desde products directo, así la orden queda congelada aunque el catálogo cambie después
  const orderItems: OrderItem[] = itemsWithDetails.map((item) => ({
    productId: item.productId,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
  }))

  const handleConfirm = async () => {
    if (!user) return
    setConfirming(true)
    setError(null)
    try {
      const orderId = await createOrder({ userId: user.uid, items: orderItems, total })
      // vacía el carrito: mismo mecanismo ya existente (CLEAR_CART + persistencia con debounce)
      clearCart()
      navigate(ROUTES.orderDetail.replace(':id', orderId))
    } catch (err) {
      setError(getErrorMessage(err))
      setConfirming(false)
    }
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <h1 className="text-2xl font-bold text-brand-700 sm:text-3xl">Confirmar compra</h1>

      {error && <ErrorState message={error} />}

      <OrderSummary items={orderItems} total={total} />

      <Button type="button" variant="primary" isLoading={confirming} onClick={handleConfirm}>
        Confirmar orden
      </Button>
    </main>
  )
}
