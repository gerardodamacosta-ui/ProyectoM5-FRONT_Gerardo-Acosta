import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import { AdminCard } from '@/modules/admin/components/AdminCard'
import { ProductForm } from '@/modules/admin/components/ProductForm'

export function AdminProductCreatePage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <h2 className="text-xl font-semibold">Nuevo producto</h2>
      <AdminCard>
        <ProductForm mode="create" onSuccess={() => navigate(ROUTES.adminProducts)} />
      </AdminCard>
    </div>
  )
}
