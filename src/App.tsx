import { AuthProvider } from '@/modules/auth/context/AuthContext'
import { CartProvider } from '@/modules/cart/context/CartContext'
import { AppRouter } from '@/router/AppRouter'

// componente raíz — providers globales + ruteo
function App() {
  return (
    // AuthProvider envuelve toda la app: cualquier ruta puede consultar la sesión
    // CartProvider va adentro: necesita useAuth() para saber de quién es el carrito
    <AuthProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AuthProvider>
  )
}

export default App
