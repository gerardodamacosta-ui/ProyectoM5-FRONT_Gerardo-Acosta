import { useAsyncState } from '@/shared/hooks/useAsyncState'
import { getProductById } from '@/modules/products/services/products.api'

// trae un producto puntual por id — re-fetchea si el id cambia (navegación entre detalles)
export function useProduct(id: string) {
  return useAsyncState(() => getProductById(id), [id])
}
