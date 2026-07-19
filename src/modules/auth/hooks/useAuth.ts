import { useContext } from 'react'
import { AuthContext } from '@/modules/auth/context/AuthContext'

// acceso al contexto de auth con guardia: falla con mensaje claro si falta el provider
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return context
}
