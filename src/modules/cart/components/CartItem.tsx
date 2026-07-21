import { formatPrice } from '@/shared/utils/formatters'
import type { CartItemWithDetails } from '@/modules/cart/hooks/useCart'

// presentacional: pinta una fila del carrito, delega en el padre qué hacer con cada acción
interface CartItemProps {
  item: CartItemWithDetails
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { product, quantity } = item

  return (
    <li className="flex items-center gap-3 border-b border-gray-200 py-3 last:border-b-0">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
      />
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-semibold text-gray-900 sm:text-base">{product.name}</p>
        <p className="text-xs text-gray-600 sm:text-sm">{formatPrice(product.price)} c/u</p>
        {/* selector de cantidad: +/- ajustan de a uno; llegar a 0 remueve el item (ver cartReducer) */}
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.productId, quantity - 1)}
            aria-label={`Restar unidad de ${product.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-sm font-bold text-gray-700"
          >
            −
          </button>
          <span className="w-6 text-center text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.productId, quantity + 1)}
            aria-label={`Sumar unidad de ${product.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-sm font-bold text-gray-700"
          >
            +
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <p className="text-sm font-bold text-gray-900 sm:text-base">
          {formatPrice(product.price * quantity)}
        </p>
        <button
          type="button"
          onClick={() => onRemove(item.productId)}
          className="text-xs text-red-600 underline"
        >
          Eliminar
        </button>
      </div>
    </li>
  )
}
