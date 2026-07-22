import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import { ProductForm } from '@/modules/admin/components/ProductForm'

export function AdminProductCreatePage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <h2 className="text-xl font-semibold">Nuevo producto</h2>
      {/* card blanca: ProductForm está pensado para fondo claro, AdminLayout es oscuro */}
      <div className="rounded-xl bg-white p-4 sm:p-6">
        <ProductForm mode="create" onSuccess={() => navigate(ROUTES.adminProducts)} />
      </div>
    </div>
  )
}
