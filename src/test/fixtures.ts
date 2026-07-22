// datos mockeados reutilizables entre archivos de test — evita duplicar el mismo setup
// (usuario admin, customer, producto, ítem de carrito, orden) en cada test
import type { User } from '@/modules/auth/types/user.types'
import type { CartItem } from '@/modules/cart/types/cart.types'
import type { Order } from '@/modules/orders/types/order.types'
import type { Product } from '@/modules/products/types/product.types'

export const mockCustomerUser: User = {
  uid: 'customer-uid',
  email: 'customer@test.com',
  displayName: 'Cliente de Prueba',
  role: 'customer',
  createdAt: '2026-01-01T00:00:00.000Z',
}

export const mockAdminUser: User = {
  uid: 'admin-uid',
  email: 'admin@test.com',
  displayName: 'Admin de Prueba',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
}

export const mockProduct: Product = {
  id: 'product-1',
  name: 'Notebook de prueba',
  description: 'Descripción de prueba',
  price: 1000,
  category: 'Notebooks',
  imageUrl: 'https://example.com/notebook.jpg',
  stock: 10,
  createdAt: '2026-01-01T00:00:00.000Z',
}

export const mockCartItem: CartItem = {
  productId: mockProduct.id,
  quantity: 2,
}

export const mockOrder: Order = {
  id: 'order-1',
  userId: mockCustomerUser.uid,
  items: [
    {
      productId: mockProduct.id,
      name: mockProduct.name,
      price: mockProduct.price,
      quantity: 2,
    },
  ],
  total: mockProduct.price * 2,
  status: 'pending',
  createdAt: '2026-01-01T00:00:00.000Z',
}
