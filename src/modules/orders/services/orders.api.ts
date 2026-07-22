import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import type { DocumentSnapshot, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { COLLECTIONS } from '@/config/constants'
import { handleServiceError } from '@/shared/utils/handleServiceError'
import type { CreateOrderInput, Order, OrderItem, OrderStatus } from '@/modules/orders/types/order.types'

// mapeo de datos: doc crudo de Firestore → tipo Order del dominio (Firestore no tipa nada)
// createdAt llega como Timestamp de Firestore, se convierte a ISO string acá (mismo criterio
// que mapToProduct/mapToUser, el dominio nunca expone el tipo Timestamp)
function mapToOrder(snapshot: DocumentSnapshot | QueryDocumentSnapshot): Order {
  const data = snapshot.data() ?? {}
  const createdAt = data.createdAt as Timestamp | undefined
  return {
    id: snapshot.id,
    userId: (data.userId as string) ?? '',
    items: (data.items as OrderItem[]) ?? [],
    total: (data.total as number) ?? 0,
    status: (data.status as OrderStatus) ?? 'pending',
    createdAt: createdAt ? createdAt.toDate().toISOString() : '',
  }
}

// crea la orden: status siempre 'pending', nunca se manda otro valor desde el cliente
// (el cambio de estado es del panel admin, hito aparte)
export async function createOrder(input: CreateOrderInput): Promise<string> {
  try {
    const ref = await addDoc(collection(db, COLLECTIONS.orders), {
      ...input,
      status: 'pending',
      createdAt: serverTimestamp(),
    })
    return ref.id
  } catch (error) {
    handleServiceError(error, 'orders.createOrder')
  }
}

// historial del usuario logueado, más nuevas primero — requiere el índice compuesto
// (userId asc, createdAt desc) declarado en firestore.indexes.json
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const ordersQuery = query(
      collection(db, COLLECTIONS.orders),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(ordersQuery)
    return snapshot.docs.map(mapToOrder)
  } catch (error) {
    handleServiceError(error, 'orders.getUserOrders')
  }
}

// trae una orden puntual; null si no existe (la página de detalle decide qué mostrar).
// si la orden es de otro usuario, la security rule deniega el read antes de llegar acá
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const snapshot = await getDoc(doc(db, COLLECTIONS.orders, orderId))
    return snapshot.exists() ? mapToOrder(snapshot) : null
  } catch (error) {
    handleServiceError(error, 'orders.getOrder')
  }
}

// todas las órdenes del sistema (panel admin) — sin filtro por userId, a diferencia de
// getUserOrders; la security rule permite este read solo si el caller es admin
export async function getAllOrders(): Promise<Order[]> {
  try {
    const ordersQuery = query(collection(db, COLLECTIONS.orders), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(ordersQuery)
    return snapshot.docs.map(mapToOrder)
  } catch (error) {
    handleServiceError(error, 'orders.getAllOrders')
  }
}

// cambia el estado de una orden (panel admin) — la security rule bloquea esto para el
// customer, que no debe poder cambiar el estado de su propia orden
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.orders, id), { status })
  } catch (error) {
    handleServiceError(error, 'orders.updateOrderStatus')
  }
}
