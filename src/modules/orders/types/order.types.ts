import type { ORDER_STATUSES } from '@/config/constants'

// derivado de la constante centralizada: no se puede tipar un estado que no exista ahí,
// mismo criterio que ProductCategory (ver product.types.ts)
export type OrderStatus = (typeof ORDER_STATUSES)[number]

// snapshot inmutable del producto al momento del checkout — a diferencia del carrito
// (que resuelve precio en vivo contra products, ver useCart), la orden NUNCA debe
// recalcularse si el catálogo cambia después: nombre y precio quedan congelados acá
export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
}

// contrato de forma de la orden (doc en orders/{orderId}) — los datos reales viven en Firestore
export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  // ISO string, mismo criterio que Product/User — mapToOrder convierte el Timestamp de
  // Firestore acá; serverTimestamp() es una decisión de la capa de escritura, no del dominio
  createdAt: string
}

// lo que necesita createOrder — sin id (lo pone Firestore), sin createdAt (serverTimestamp)
// y sin status (el servicio siempre lo fuerza a 'pending', nunca se manda otro valor desde acá)
export type CreateOrderInput = Omit<Order, 'id' | 'createdAt' | 'status'>
