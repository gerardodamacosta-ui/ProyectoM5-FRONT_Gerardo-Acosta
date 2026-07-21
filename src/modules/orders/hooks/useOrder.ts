import { useAsyncState } from '@/shared/hooks/useAsyncState'
import { getOrder } from '@/modules/orders/services/orders.api'

// una orden puntual — re-fetchea si el id cambia, mismo patrón que useProduct
export function useOrder(orderId: string) {
  return useAsyncState(() => getOrder(orderId), [orderId])
}
