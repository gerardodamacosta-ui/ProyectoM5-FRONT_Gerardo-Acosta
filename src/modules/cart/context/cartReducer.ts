import type { CartAction, CartItem } from '@/modules/cart/types/cart.types'

// reducer puro sobre el array de items — el `loading` de la hidratación inicial
// vive aparte en el provider (no es parte del estado de los items en sí)
export function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    // si el producto ya está en el carrito, suma la cantidad; si no, lo agrega
    case 'ADD_ITEM': {
      const { productId, quantity } = action.payload
      const existing = state.find((item) => item.productId === productId)
      if (existing) {
        return state.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      return [...state, { productId, quantity }]
    }
    // saca el item del carrito por completo
    case 'REMOVE_ITEM':
      return state.filter((item) => item.productId !== action.payload.productId)
    // cantidad 0 o negativa: se remueve, no se deja un item colgado en 0
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload
      if (quantity <= 0) return state.filter((item) => item.productId !== productId)
      return state.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    }
    // vacía el carrito (ej. después de un checkout, hito aparte)
    case 'CLEAR_CART':
      return []
    // reemplaza el array completo — se usa al hidratar desde Firestore al loguear
    case 'SET_CART':
      return action.payload
  }
}
