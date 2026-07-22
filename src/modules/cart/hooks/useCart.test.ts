import { renderHook, waitFor } from '@testing-library/react'
import { mockProduct } from '@/test/fixtures'
import { AllProviders } from '@/test/renderWithProviders'
import { useCart } from './useCart'

// getProducts se mockea a nivel de nuestra propia capa de servicios (products.api.ts), no del
// SDK de Firebase función por función: en este entorno de test, Firestore no pasa por MSW
// (ver bitácora del hito — la llamada real ni siquiera pasa por los interceptores de red),
// así que la única forma segura de no pegarle a Firestore real es mockear este límite
vi.mock('@/modules/products/services/products.api', () => ({
  getProducts: vi.fn().mockResolvedValue([mockProduct]),
}))

describe('useCart', () => {
  it('lanza un error si se usa fuera de CartProvider', () => {
    expect(() => renderHook(() => useCart())).toThrow(
      'useCart debe usarse dentro de <CartProvider>'
    )
  })

  it('arranca vacío sin sesión (sin producto ni carrito que hidratar)', async () => {
    const { result } = renderHook(() => useCart(), { wrapper: AllProviders })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.itemsWithDetails).toEqual([])
    expect(result.current.itemCount).toBe(0)
    expect(result.current.total).toBe(0)
  })
})
