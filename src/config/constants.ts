// constantes centralizadas de la app — nada de hardcode suelto en componentes

// categorías de producto: conjunto chico y estable, NO es colección de Firestore
export const PRODUCT_CATEGORIES = [
  'Notebooks',
  'Celulares',
  'Accesorios',
  'Audio',
  'Gaming',
  'Componentes',
] as const

// estados posibles de una orden (coinciden con el modelo de datos en Firestore)
export const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'] as const

// nombres de las colecciones de Firestore — un typo acá rompería todo, mejor una sola fuente
export const COLLECTIONS = {
  users: 'users',
  products: 'products',
  carts: 'carts',
  orders: 'orders',
} as const

// rutas de la app: única fuente de verdad para router, links y redirecciones
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  catalog: '/products',
  productDetail: '/products/:id',
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
  orderDetail: '/orders/:id',
  admin: '/admin',
  adminProducts: '/admin/products',
  adminProductNew: '/admin/products/new',
  adminProductEdit: '/admin/products/:productId/edit',
  adminOrders: '/admin/orders',
} as const
