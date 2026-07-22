import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import type { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { COLLECTIONS } from '@/config/constants'
import { handleServiceError } from '@/shared/utils/handleServiceError'
import type {
  CreateProductInput,
  Product,
  ProductCategory,
  UpdateProductInput,
} from '@/modules/products/types/product.types'

// mapeo de datos: doc crudo de Firestore → tipo Product del dominio (Firestore no tipa nada)
// el id no viaja como campo del doc: se toma del snapshot (snapshot.id)
function mapToProduct(snapshot: DocumentSnapshot | QueryDocumentSnapshot): Product {
  const data = snapshot.data() ?? {}
  return {
    id: snapshot.id,
    name: (data.name as string) ?? '',
    description: (data.description as string) ?? '',
    price: (data.price as number) ?? 0,
    category: (data.category as ProductCategory) ?? 'Accesorios',
    imageUrl: (data.imageUrl as string) ?? '',
    stock: (data.stock as number) ?? 0,
    createdAt: (data.createdAt as string) ?? '',
  }
}

// trae todos los productos — sin filtro: el filtrado por categoría/búsqueda es responsabilidad de la UI
export async function getProducts(): Promise<Product[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.products))
    return snapshot.docs.map(mapToProduct)
  } catch (error) {
    handleServiceError(error, 'products.getProducts')
  }
}

// trae un producto puntual por id — null si no existe (la página de detalle decide qué mostrar)
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const snapshot = await getDoc(doc(db, COLLECTIONS.products, id))
    return snapshot.exists() ? mapToProduct(snapshot) : null
  } catch (error) {
    handleServiceError(error, 'products.getProductById')
  }
}

// crea un producto (panel admin) — createdAt en ISO desde el cliente, mismo criterio que
// User y que scripts/seed-products.ts (mapToProduct no convierte Timestamp→ISO, a diferencia
// de mapToOrder, así que acá NO se usa serverTimestamp())
export async function createProduct(input: CreateProductInput): Promise<Product> {
  try {
    const ref = await addDoc(collection(db, COLLECTIONS.products), {
      ...input,
      createdAt: new Date().toISOString(),
    })
    const snapshot = await getDoc(ref)
    return mapToProduct(snapshot)
  } catch (error) {
    handleServiceError(error, 'products.createProduct')
  }
}

// edita un producto existente (panel admin) — nunca toca createdAt
export async function updateProduct(id: string, data: UpdateProductInput): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.products, id), data)
  } catch (error) {
    handleServiceError(error, 'products.updateProduct')
  }
}

// borra un producto (panel admin) — hard delete real, sin soft delete.
// no borra el objeto en S3 (pendiente conocido, fuera de alcance de este hito)
export async function deleteProduct(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.products, id))
  } catch (error) {
    handleServiceError(error, 'products.deleteProduct')
  }
}
