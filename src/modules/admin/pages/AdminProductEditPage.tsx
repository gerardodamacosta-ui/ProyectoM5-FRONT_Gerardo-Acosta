import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import { LoadingState } from '@/shared/components/ui/states/LoadingState'
import { ErrorState } from '@/shared/components/ui/states/ErrorState'
import { AdminCard } from '@/modules/admin/components/AdminCard'
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
      <AdminCard>
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
      </AdminCard>
    </div>
  )
}
