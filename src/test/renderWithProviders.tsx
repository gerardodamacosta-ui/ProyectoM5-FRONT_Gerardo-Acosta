import type { ReactElement, ReactNode } from 'react'
import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/modules/auth/context/AuthContext'
import { CartProvider } from '@/modules/cart/context/CartContext'

// wrapper de providers para tests de componentes/hooks que dependen de AuthContext y
// CartContext a la vez — CartProvider va adentro porque internamente usa useAuth()
export function AllProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}

export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options })
}
