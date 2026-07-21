import { useMemo, useState } from 'react'
import { LoadingState } from '@/shared/components/ui/states/LoadingState'
import { ErrorState } from '@/shared/components/ui/states/ErrorState'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { normalizeText } from '@/shared/utils/normalizeText'
import { CategoryFilter } from '@/modules/products/components/CategoryFilter'
import type { CategoryFilterValue } from '@/modules/products/components/CategoryFilter'
import { ProductGrid } from '@/modules/products/components/ProductGrid'
import { SearchBar } from '@/modules/products/components/SearchBar'
import { useProducts } from '@/modules/products/hooks/useProducts'

export function CatalogPage() {
  const { data: products, loading, error } = useProducts()
  const [category, setCategory] = useState<CategoryFilterValue>('all')
  const [search, setSearch] = useState('')
  // pausa el filtrado hasta que el usuario deja de tipear, no re-filtra en cada tecla
  const debouncedSearch = useDebounce(search)

  // filtrado 100% client-side sobre el array ya cargado — no hay re-fetch a Firestore
  const filteredProducts = useMemo(() => {
    if (!products) return []
    // se normaliza una sola vez, fuera del loop de productos
    const normalizedSearch = normalizeText(debouncedSearch.trim())
    return products.filter((product) => {
      const matchesCategory = category === 'all' || product.category === category
      // matchea por nombre O categoría, ambos normalizados (sin mayúsculas/acentos)
      const matchesSearch =
        normalizeText(product.name).includes(normalizedSearch) ||
        normalizeText(product.category).includes(normalizedSearch)
      return matchesCategory && matchesSearch
    })
  }, [products, category, debouncedSearch])

  if (loading) return <LoadingState text="Cargando catálogo..." />
  if (error) return <ErrorState message={error} />

  // dos mensajes de "vacío" distintos: catálogo realmente vacío vs. filtro/búsqueda sin resultados
  const hasActiveFilter = category !== 'all' || debouncedSearch.trim() !== ''
  const emptyMessage =
    products && products.length === 0
      ? 'No hay productos disponibles todavía.'
      : hasActiveFilter
        ? 'No encontramos productos para ese filtro o búsqueda.'
        : 'No hay productos disponibles todavía.'

  return (
    // mobile first: padding y gap base, crecen desde sm:
    <main className="mx-auto flex max-w-6xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <h1 className="text-2xl font-bold text-brand-700 sm:text-3xl">Catálogo</h1>

      <SearchBar value={search} onChange={setSearch} />
      <CategoryFilter selected={category} onChange={setCategory} />

      <ProductGrid products={filteredProducts} emptyMessage={emptyMessage} />
    </main>
  )
}
