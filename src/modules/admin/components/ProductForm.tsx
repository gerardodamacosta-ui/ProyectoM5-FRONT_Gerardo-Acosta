import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { PRODUCT_CATEGORIES } from '@/config/constants'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { ErrorState } from '@/shared/components/ui/states/ErrorState'
import { AppError } from '@/shared/types/error.types'
import { getUploadUrl, uploadImageToS3 } from '@/modules/admin/services/upload.api'
import { createProduct, updateProduct } from '@/modules/products/services/products.api'
import type { Product, ProductCategory } from '@/modules/products/types/product.types'

// discriminated union (nivel simple, ver CLAUDE.md): en modo edit, initialData es obligatorio
type ProductFormProps =
  | { mode: 'create'; onSuccess: () => void }
  | { mode: 'edit'; initialData: Product; onSuccess: () => void }

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error'

// clases compartidas por los campos que no pasan por el componente Input (textarea/select) —
// constante local, no un componente nuevo en shared/ui: hoy son los únicos dos call sites.
// text-gray-900 explícito: sin esto heredan el text-white de AdminLayout y quedan ilegibles
// sobre la card blanca
const FIELD_CLASSES =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 sm:text-base'

// mensaje apto para UI: AppError ya viene legible desde los servicios; el resto cae al genérico
function getErrorMessage(error: unknown): string {
  return error instanceof AppError ? error.message : 'Ocurrió un error inesperado.'
}

export function ProductForm(props: ProductFormProps) {
  const { mode, onSuccess } = props
  const initialData = props.mode === 'edit' ? props.initialData : undefined

  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [price, setPrice] = useState(initialData ? String(initialData.price) : '')
  const [category, setCategory] = useState<ProductCategory>(
    initialData?.category ?? PRODUCT_CATEGORIES[0]
  )
  const [stock, setStock] = useState(initialData ? String(initialData.stock) : '')
  // en edit arranca precargada con la imagen existente — reemplazarla es opcional
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '')

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const priceValue = Number(price)
  const stockValue = Number(stock)
  const isPriceValid = price.trim() !== '' && priceValue > 0
  const isStockValid = stock.trim() !== '' && Number.isInteger(stockValue) && stockValue >= 0
  // en create la imagen es obligatoria; en edit ya viene resuelta desde initialData
  const missingRequiredImage = mode === 'create' && !imageUrl
  const canSubmit =
    name.trim() !== '' &&
    description.trim() !== '' &&
    isPriceValid &&
    isStockValid &&
    !missingRequiredImage &&
    !submitting

  // al elegir un archivo, sube directo a S3 vía el BFF (getUploadUrl + uploadImageToS3, Punto 2)
  // y guarda la publicUrl resultante — no pasa por nuestro servidor
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadStatus('uploading')
    setUploadError(null)
    try {
      const { uploadUrl, publicUrl } = await getUploadUrl(file.type)
      await uploadImageToS3(file, uploadUrl)
      setImageUrl(publicUrl)
      setUploadStatus('done')
    } catch (error) {
      setUploadStatus('error')
      setUploadError(getErrorMessage(error))
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    // guarda extra por si el form se envía por Enter con el botón deshabilitado
    if (!canSubmit) return

    setSubmitting(true)
    setSubmitError(null)

    const data = { name, description, price: priceValue, category, imageUrl, stock: stockValue }

    try {
      if (props.mode === 'create') {
        await createProduct(data)
      } else {
        await updateProduct(props.initialData.id, data)
      }
      onSuccess()
    } catch (error) {
      setSubmitError(getErrorMessage(error))
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {submitError && <ErrorState message={submitError} />}

      <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />

      {/* sin componente Textarea compartido: hoy es el único campo multilínea de la app,
          no amerita todavía una abstracción nueva en shared/ui (mismo criterio que el select) */}
      <div className="flex w-full flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className={FIELD_CLASSES}
        />
      </div>

      <Input
        label="Precio"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        error={price.trim() !== '' && !isPriceValid ? 'El precio debe ser mayor a 0.' : undefined}
        required
      />

      {/* select inline, no un componente Select compartido nuevo: hoy es el único consumidor */}
      <div className="flex w-full flex-col gap-1">
        <label htmlFor="category" className="text-sm font-medium text-gray-700">
          Categoría
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ProductCategory)}
          className={FIELD_CLASSES}
        >
          {PRODUCT_CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Stock"
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        error={
          stock.trim() !== '' && !isStockValid
            ? 'El stock debe ser un entero mayor o igual a 0.'
            : undefined
        }
        required
      />

      <div className="flex w-full flex-col gap-2">
        <label htmlFor="image" className="text-sm font-medium text-gray-700">
          Imagen
        </label>
        {imageUrl && (
          <img src={imageUrl} alt="Vista previa" className="h-32 w-32 rounded-lg object-cover" />
        )}
        <input
          id="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          // el preflight de Tailwind resetea la apariencia nativa del botón "Seleccionar
          // archivo" (pseudo-elemento ::file-selector-button) — se lo repone a mano con el
          // prefijo file:, mismos colores que Button variant="primary"
          className="text-sm text-gray-900 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700"
        />
        {uploadStatus === 'uploading' && <p className="text-sm text-gray-600">Subiendo imagen...</p>}
        {uploadError && (
          <p role="alert" className="text-sm text-red-600">
            {uploadError}
          </p>
        )}
      </div>

      <Button type="submit" variant="primary" isLoading={submitting} disabled={!canSubmit}>
        {mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
      </Button>
    </form>
  )
}
