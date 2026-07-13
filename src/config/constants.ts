// constantes centralizadas de la app — nada de hardcode suelto en componentes

// categorías de producto: conjunto chico y estable, NO es colección de Firestore
// (placeholder inicial, se ajusta cuando definamos el catálogo real)
export const PRODUCT_CATEGORIES = [
  'notebooks',
  'celulares',
  'perifericos',
  'accesorios',
] as const

// estados posibles de una orden (coinciden con el modelo de datos en Firestore)
export const ORDER_STATUSES = [
  'pending',
  'processing',
  'completed',
  'cancelled',
] as const

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
  adminOrders: '/admin/orders',
} as const
