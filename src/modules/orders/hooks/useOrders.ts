import { useAsyncState } from '@/shared/hooks/useAsyncState'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { getUserOrders } from '@/modules/orders/services/orders.api'

// historial del usuario logueado, mismo patrón que useProducts sobre useAsyncState
export function useOrders() {
  const { user } = useAuth()
  return useAsyncState(() => (user ? getUserOrders(user.uid) : Promise.resolve([])), [user])
}
