import { useContext, useMemo } from 'react'
import { CartContext } from '@/modules/cart/context/CartContext'
import { useProducts } from '@/modules/products/hooks/useProducts'
import type { Product } from '@/modules/products/types/product.types'

// item del carrito con el producto completo ya resuelto (precio/nombre/imagen actuales)
export interface CartItemWithDetails {
  productId: string
  quantity: number
  product: Product
}

// acceso al carrito con guardia (mismo patrón que useAuth) + el join en vivo contra el catálogo:
// el carrito solo guarda { productId, quantity } (ver cart.types.ts), así que precio/nombre/imagen
// se resuelven acá cruzando contra useProducts(), nunca contra un snapshot viejo guardado en el item
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe usarse dentro de <CartProvider>')
  }

  const { data: products, loading: productsLoading } = useProducts()

  // cantidad total de items, independiente de que el catálogo ya haya cargado (para el badge del ícono)
  const itemCount = useMemo(
    () => context.items.reduce((sum, item) => sum + item.quantity, 0),
    [context.items]
  )

  // cruza cada item contra el catálogo; si un producto fue borrado, se filtra sin romper el total
  const itemsWithDetails = useMemo<CartItemWithDetails[]>(() => {
    if (!products) return []
    return context.items
      .map((item) => {
        const product = products.find((candidate) => candidate.id === item.productId)
        return product ? { productId: item.productId, quantity: item.quantity, product } : null
      })
      .filter((item): item is CartItemWithDetails => item !== null)
  }, [context.items, products])

  const total = useMemo(
    () => itemsWithDetails.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [itemsWithDetails]
  )

  return {
    itemsWithDetails,
    itemCount,
    total,
    // "cargando" si todavía no hidrató el carrito O todavía no llegó el catálogo para el join
    loading: context.loading || productsLoading,
    addItem: context.addItem,
    removeItem: context.removeItem,
    updateQuantity: context.updateQuantity,
    clearCart: context.clearCart,
  }
}
