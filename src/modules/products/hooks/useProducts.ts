import { useAsyncState } from '@/shared/hooks/useAsyncState'
import { getProducts } from '@/modules/products/services/products.api'

// trae el catálogo completo una vez; el filtrado por categoría/búsqueda es client-side (ver CatalogPage)
export function useProducts() {
  return useAsyncState(() => getProducts(), [])
}
