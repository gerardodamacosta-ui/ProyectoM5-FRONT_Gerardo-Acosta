import { AuthProvider } from '@/modules/auth/context/AuthContext'
import { AppRouter } from '@/router/AppRouter'

// componente raíz — providers globales + ruteo
function App() {
  return (
    // AuthProvider envuelve toda la app: cualquier ruta puede consultar la sesión
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App
