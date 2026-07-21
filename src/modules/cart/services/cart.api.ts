import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { DocumentSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { COLLECTIONS } from '@/config/constants'
import { handleServiceError } from '@/shared/utils/handleServiceError'
import type { Cart, CartItem } from '@/modules/cart/types/cart.types'

// mapeo de datos: doc crudo de Firestore → tipo Cart del dominio (Firestore no tipa nada)
function mapToCart(snapshot: DocumentSnapshot): Cart {
  const data = snapshot.data() ?? {}
  return {
    items: (data.items as CartItem[]) ?? [],
  }
}

// referencia al doc de carrito en carts/{userId}
function cartDocRef(userId: string) {
  return doc(db, COLLECTIONS.carts, userId)
}

// trae el carrito de un usuario; si el doc no existe todavía (primera vez) devuelve
// carrito vacío, no error — un carrito sin compras previas es un estado válido
export async function getCart(userId: string): Promise<Cart> {
  try {
    const snapshot = await getDoc(cartDocRef(userId))
    return snapshot.exists() ? mapToCart(snapshot) : { items: [] }
  } catch (error) {
    handleServiceError(error, 'cart.getCart')
  }
}

// persiste el carrito completo — set del array entero, no merge parcial por item
export async function setCart(userId: string, items: CartItem[]): Promise<void> {
  try {
    await setDoc(cartDocRef(userId), { items, updatedAt: new Date().toISOString() })
  } catch (error) {
    handleServiceError(error, 'cart.setCart')
  }
}
