import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import { Button } from '@/shared/components/ui/Button'
import { LoadingState } from '@/shared/components/ui/states/LoadingState'
import { ErrorState } from '@/shared/components/ui/states/ErrorState'
import { EmptyState } from '@/shared/components/ui/states/EmptyState'
import { formatPrice } from '@/shared/utils/formatters'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { useCart } from '@/modules/cart/hooks/useCart'
import { useProduct } from '@/modules/products/hooks/useProduct'

export function ProductDetailPage() {
  // la ruta es /products/:id (ver ROUTES.productDetail) — id siempre viene como string acá
  const { id } = useParams<{ id: string }>()
  const { data: product, loading, error } = useProduct(id ?? '')
  const { user } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()

  if (loading) return <LoadingState text="Cargando producto..." />
  if (error) return <ErrorState message={error} />
  if (!product) return <EmptyState text="No encontramos este producto." />

  // sin sesión no se agrega nada: va directo a loguearse (no hace falta recordar el producto)
  const handleAddToCart = () => {
    if (!user) {
      navigate(ROUTES.login)
      return
    }
    addItem(product.id)
  }

  return (
    // mobile first: columna única, pasa a 2 columnas (imagen + info) desde md:
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-6 md:flex-row">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="aspect-square w-full rounded-xl object-cover md:w-1/2"
      />
      <div className="flex flex-1 flex-col gap-3">
        <span className="text-sm font-medium text-brand-600">{product.category}</span>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>
        <p className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</p>
        <p className="text-sm text-gray-600 sm:text-base">{product.description}</p>
        {/* stock visible: transparencia simple, sin lógica de compra todavía (llega con cart) */}
        <p className="text-sm text-gray-500">
          {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Sin stock'}
        </p>
        <Button type="button" variant="primary" onClick={handleAddToCart} disabled={product.stock === 0}>
          Agregar al carrito
        </Button>
      </div>
    </main>
  )
}
