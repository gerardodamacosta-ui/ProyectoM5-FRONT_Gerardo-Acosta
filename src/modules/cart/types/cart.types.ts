// contrato de forma de un ítem del carrito — minimalista a propósito: solo guarda
// productId y quantity, nunca precio/nombre/imagen. El precio se resuelve siempre en vivo
// contra products (ver useCart), nunca un snapshot que podría quedar desactualizado
export interface CartItem {
  productId: string
  quantity: number
}

// contrato de forma del carrito (doc en carts/{userId}) — los datos reales viven en Firestore
export interface Cart {
  items: CartItem[]
}

// acciones del reducer — discriminated union, cada una con el payload mínimo que necesita
export type CartAction =
  | { type: 'ADD_ITEM'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartItem[] }
