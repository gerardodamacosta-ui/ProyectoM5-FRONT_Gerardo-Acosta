import { LoadingState } from '@/shared/components/ui/states/LoadingState'
import { EmptyState } from '@/shared/components/ui/states/EmptyState'
import { CartItem } from '@/modules/cart/components/CartItem'
import { CartSummary } from '@/modules/cart/components/CartSummary'
import { useCart } from '@/modules/cart/hooks/useCart'

export function CartPage() {
  const { itemsWithDetails, total, loading, updateQuantity, removeItem } = useCart()

  if (loading) return <LoadingState text="Cargando tu carrito..." />
  if (itemsWithDetails.length === 0) return <EmptyState text="Tu carrito está vacío." />

  return (
    // mobile first: columna única, ancho máximo para que no se estire demasiado en desktop
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <h1 className="text-2xl font-bold text-brand-700 sm:text-3xl">Mi carrito</h1>

      <ul className="flex flex-col rounded-xl border border-gray-200 bg-white px-4">
        {itemsWithDetails.map((item) => (
          <CartItem
            key={item.productId}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </ul>

      <CartSummary total={total} />
    </main>
  )
}
