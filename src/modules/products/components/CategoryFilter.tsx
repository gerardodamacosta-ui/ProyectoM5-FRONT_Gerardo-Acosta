import { PRODUCT_CATEGORIES } from '@/config/constants'
import type { ProductCategory } from '@/modules/products/types/product.types'

// 'all' no es una categoría real: representa "sin filtro" en la UI
export type CategoryFilterValue = ProductCategory | 'all'

interface CategoryFilterProps {
  selected: CategoryFilterValue
  onChange: (category: CategoryFilterValue) => void
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    // mobile first: chips que se envuelven en varias líneas si no entran en una sola
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
      <FilterChip label="Todas" active={selected === 'all'} onClick={() => onChange('all')} />
      {PRODUCT_CATEGORIES.map((category) => (
        <FilterChip
          key={category}
          label={category}
          active={selected === category}
          onClick={() => onChange(category)}
        />
      ))}
    </div>
  )
}

// chip interno: no se exporta, es un detalle de implementación de CategoryFilter
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-gray-300 text-gray-700 hover:bg-brand-50'
      }`}
    >
      {label}
    </button>
  )
}
