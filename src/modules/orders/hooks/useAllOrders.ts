import { useAsyncState } from '@/shared/hooks/useAsyncState'
import { getAllOrders } from '@/modules/orders/services/orders.api'

// todas las órdenes del sistema — consumido por el panel admin, no filtra por usuario
// (a diferencia de useOrders, que sí filtra por el usuario logueado)
export function useAllOrders() {
  return useAsyncState(() => getAllOrders(), [])
}
