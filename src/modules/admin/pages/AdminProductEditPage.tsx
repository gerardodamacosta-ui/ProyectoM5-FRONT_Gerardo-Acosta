import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import { LoadingState } from '@/shared/components/ui/states/LoadingState'
import { ErrorState } from '@/shared/components/ui/states/ErrorState'
import { ProductForm } from '@/modules/admin/components/ProductForm'
import { useProduct } from '@/modules/products/hooks/useProduct'

export function AdminProductEditPage() {
  // la ruta es /admin/products/:productId/edit — ver ROUTES.adminProductEdit
  const { productId } = useParams<{ productId: string }>()
  const { data: product, loading, error } = useProduct(productId ?? '')
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <h2 className="text-xl font-semibold">Editar producto</h2>
      {/* card blanca: mismo motivo que en AdminProductCreatePage — envuelve loading/error/form
          por igual para que se lea bien sobre el fondo oscuro de AdminLayout */}
      <div className="rounded-xl bg-white p-4 sm:p-6">
        {loading && <LoadingState text="Cargando producto..." />}
        {error && <ErrorState message={error} />}
        {!loading && !error && !product && <ErrorState message="No encontramos este producto." />}
        {!loading && !error && product && (
          <ProductForm
            mode="edit"
            initialData={product}
            onSuccess={() => navigate(ROUTES.adminProducts)}
          />
        )}
      </div>
    </div>
  )
}
