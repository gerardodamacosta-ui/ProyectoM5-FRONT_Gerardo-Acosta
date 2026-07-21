import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { RegisterPage } from '@/modules/auth/pages/RegisterPage'
import { CartPage } from '@/modules/cart/pages/CartPage'
import { CheckoutPage } from '@/modules/checkout/pages/CheckoutPage'
import { OrderDetailPage } from '@/modules/orders/pages/OrderDetailPage'
import { OrdersPage } from '@/modules/orders/pages/OrdersPage'
import { CatalogPage } from '@/modules/products/pages/CatalogPage'
import { ProductDetailPage } from '@/modules/products/pages/ProductDetailPage'

// placeholder temporal del home hasta que exista el catálogo real
function HomePlaceholder() {
  return (
    // mobile first: clases base sin prefijo, escala con sm:/md:/lg:
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-brand-50 p-4">
      <h1 className="text-2xl font-bold text-brand-700 sm:text-3xl">Patagonix Tech</h1>
      <p className="text-sm text-gray-600 sm:text-base">
        Scaffold inicial — Vite + React 18 + TypeScript + Tailwind
      </p>
    </main>
  )
}

// enrutador central de la app — las rutas reales se agregan a medida que cada módulo tenga sus páginas
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.home} element={<HomePlaceholder />} />
        {/* rutas públicas de auth */}
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
        {/* catálogo público: navegable sin login, ver alcance del Hito 3 */}
        <Route path={ROUTES.catalog} element={<CatalogPage />} />
        <Route path={ROUTES.productDetail} element={<ProductDetailPage />} />
        {/* carrito: requiere sesión, cualquier rol (customer o admin) */}
        <Route
          path={ROUTES.cart}
          element={
            <ProtectedRoute allowedRoles={['customer', 'admin']}>
              <CartPage />
            </ProtectedRoute>
          }
        />
        {/* checkout: requiere sesión, cualquier rol */}
        <Route
          path={ROUTES.checkout}
          element={
            <ProtectedRoute allowedRoles={['customer', 'admin']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        {/* historial y detalle de órdenes: requiere sesión, cualquier rol */}
        <Route
          path={ROUTES.orders}
          element={
            <ProtectedRoute allowedRoles={['customer', 'admin']}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.orderDetail}
          element={
            <ProtectedRoute allowedRoles={['customer', 'admin']}>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
