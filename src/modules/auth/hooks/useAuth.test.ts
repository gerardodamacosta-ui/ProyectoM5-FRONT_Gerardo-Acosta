import { renderHook, waitFor } from '@testing-library/react'
import { AllProviders } from '@/test/renderWithProviders'
import { useAuth } from './useAuth'

describe('useAuth', () => {
  it('lanza un error si se usa fuera de AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth debe usarse dentro de <AuthProvider>'
    )
  })

  it('arranca en loading y resuelve a sesión cerrada sin usuario persistido', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AllProviders })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
  })
})
