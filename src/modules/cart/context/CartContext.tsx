import { createContext, useCallback, useEffect, useReducer, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { AppError } from '@/shared/types/error.types'
import * as cartApi from '@/modules/cart/services/cart.api'
import type { CartItem } from '@/modules/cart/types/cart.types'
import { cartReducer } from './cartReducer'

// lo que expone el contexto: items resueltos + funciones semánticas, no los type string del reducer
interface CartContextValue {
  items: CartItem[]
  // true mientras se resuelve la hidratación inicial desde Firestore
  loading: boolean
  addItem: (productId: string, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

// null fuera del provider — useCart lo detecta y falla con mensaje claro
export const CartContext = createContext<CartContextValue | null>(null)

// mensaje apto para UI: AppError ya viene legible desde los servicios; el resto cae al genérico
function getErrorMessage(error: unknown): string {
  return error instanceof AppError ? error.message : 'Ocurrió un error inesperado.'
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, dispatch] = useReducer(cartReducer, [])
  const [loading, setLoading] = useState(false)
  // gatilla la persistencia recién después de terminar de hidratar: evita que el propio
  // SET_CART inicial dispare una escritura de eco con los mismos datos que se acaban de leer
  const [hydrated, setHydrated] = useState(false)

  // hidrata el carrito al loguearse (o cambiar de usuario); si no hay sesión, limpia el estado
  // local (no se persiste nada de un carrito anónimo, no aplica acá)
  useEffect(() => {
    setHydrated(false)
    if (!user) {
      dispatch({ type: 'CLEAR_CART' })
      return
    }
    setLoading(true)
    cartApi
      .getCart(user.uid)
      .then((cart) => dispatch({ type: 'SET_CART', payload: cart.items }))
      .catch((error: unknown) => {
        // no hay un estado de error dedicado para el carrito, pero el error nunca queda silencioso
        console.error('[CartContext.hydrate]', getErrorMessage(error))
      })
      .finally(() => {
        setLoading(false)
        setHydrated(true)
      })
  }, [user])

  // debounce sobre los items antes de persistir: evita escribir en Firestore en cada click de +/-
  const debouncedItems = useDebounce(items, 800)

  // persiste a Firestore solo cuando el array debounced cambia, ya hidratado y con sesión activa
  useEffect(() => {
    if (!user || !hydrated) return
    cartApi.setCart(user.uid, debouncedItems).catch((error: unknown) => {
      console.error('[CartContext.persist]', getErrorMessage(error))
    })
  }, [debouncedItems, user, hydrated])

  // funciones semánticas: los componentes no conocen los type string del reducer
  const addItem = useCallback((productId: string, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { productId, quantity } })
  }, [])

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } })
  }, [])

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), [])

  return (
    <CartContext.Provider value={{ items, loading, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}
