import { Link } from 'react-router-dom'
import { formatPrice } from '@/shared/utils/formatters'
import type { Product } from '@/modules/products/types/product.types'

// presentacional: solo pinta un producto, no sabe de dónde viene la lista ni cómo se filtró
interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
    >
      {/* aspect-square: todas las cards miden igual aunque las imágenes tengan proporciones distintas */}
      <img
        src={product.imageUrl}
        alt={product.name}
        className="aspect-square w-full object-cover"
        loading="lazy"
      />
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs font-medium text-brand-600">{product.category}</span>
        <h3 className="text-sm font-semibold text-gray-900 sm:text-base">{product.name}</h3>
        <p className="mt-auto text-base font-bold text-gray-900 sm:text-lg">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  )
}
