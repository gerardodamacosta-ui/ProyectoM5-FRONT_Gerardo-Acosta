import type { PRODUCT_CATEGORIES } from '@/config/constants'

// derivado de la constante centralizada: no se puede escribir una categoría que no exista ahí
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

// contrato de forma del producto (doc en products/{productId}) — los datos reales viven en Firestore
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: ProductCategory
  imageUrl: string
  stock: number
  // fecha de alta en ISO, mismo criterio que User (ver user.types.ts)
  createdAt: string
}
