import { EmptyState } from '@/shared/components/ui/states/EmptyState'
import { ProductCard } from '@/modules/products/components/ProductCard'
import type { Product } from '@/modules/products/types/product.types'

// presentacional: pinta la grilla ya filtrada; el mensaje de "vacío" lo decide quien
// llama (CatalogPage sabe si es "no hay productos" o "sin resultados para el filtro")
interface ProductGridProps {
  products: Product[]
  emptyMessage: string
}

export function ProductGrid({ products, emptyMessage }: ProductGridProps) {
  if (products.length === 0) return <EmptyState text={emptyMessage} />

  return (
    // mobile first: 1 columna, escala a 2/3/4 según el ancho disponible (sm/md/lg, sin breakpoint custom)
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
