import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import { Modal } from '@/shared/components/ui/Modal'
import { LoadingState } from '@/shared/components/ui/states/LoadingState'
import { ErrorState } from '@/shared/components/ui/states/ErrorState'
import { EmptyState } from '@/shared/components/ui/states/EmptyState'
import { AppError } from '@/shared/types/error.types'
import { formatPrice } from '@/shared/utils/formatters'
import { deleteProduct } from '@/modules/products/services/products.api'
import { useProducts } from '@/modules/products/hooks/useProducts'
import type { Product } from '@/modules/products/types/product.types'

// mensaje apto para UI: AppError ya viene legible desde los servicios; el resto cae al genérico
function getErrorMessage(error: unknown): string {
  return error instanceof AppError ? error.message : 'Ocurrió un error inesperado.'
}

export function AdminProductsPage() {
  const { data: products, loading, error, refetch } = useProducts()
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleConfirmDelete = async () => {
    if (!productToDelete) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteProduct(productToDelete.id)
      setProductToDelete(null)
      // refetch en vez de estado admin paralelo: la tabla se resincroniza con Firestore
      refetch()
    } catch (err) {
      setDeleteError(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Productos</h2>
        <Link
          to={ROUTES.adminProductNew}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Nuevo producto
        </Link>
      </div>

      {/* card blanca: mismo motivo que en las páginas de create/edit — los states/inputs
          compartidos están pensados para fondo claro, AdminLayout es oscuro */}
      <div className="rounded-xl bg-white p-4 sm:p-6">
        {loading && <LoadingState text="Cargando productos..." />}
        {error && <ErrorState message={error} />}
        {!loading && !error && (!products || products.length === 0) && (
          <EmptyState text="No hay productos cargados todavía." />
        )}
        {!loading && !error && products && products.length > 0 && (
          <ul className="flex flex-col">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex flex-wrap items-center gap-3 border-b border-gray-200 py-3 last:border-b-0"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                />
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-semibold text-gray-900">{product.name}</span>
                  <span className="text-xs text-gray-500">
                    {product.category} · Stock: {product.stock}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                <div className="flex gap-3">
                  <Link
                    to={ROUTES.adminProductEdit.replace(':productId', product.id)}
                    className="text-sm text-brand-600 underline"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => setProductToDelete(product)}
                    className="text-sm text-red-600 underline"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        isOpen={productToDelete !== null}
        onClose={() => setProductToDelete(null)}
        title="Eliminar producto"
      >
        <p className="text-sm text-gray-700">
          ¿Seguro que querés eliminar "{productToDelete?.name}"? Esta acción no se puede deshacer.
        </p>
        {/* pendiente conocido: no borra el objeto en S3, solo el doc en Firestore (fuera de alcance) */}
        {deleteError && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {deleteError}
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setProductToDelete(null)}
            disabled={deleting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
