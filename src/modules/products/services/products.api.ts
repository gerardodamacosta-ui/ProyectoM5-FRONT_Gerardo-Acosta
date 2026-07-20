import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import type { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { COLLECTIONS } from '@/config/constants'
import { handleServiceError } from '@/shared/utils/handleServiceError'
import type { Product, ProductCategory } from '@/modules/products/types/product.types'

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
