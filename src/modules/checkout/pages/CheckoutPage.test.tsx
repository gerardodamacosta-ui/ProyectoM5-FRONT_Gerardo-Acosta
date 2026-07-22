import { useEffect } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { mockCustomerUser, mockProduct } from '@/test/fixtures'
import { CartProvider } from '@/modules/cart/context/CartContext'
import { useCart } from '@/modules/cart/hooks/useCart'
import { CheckoutPage } from './CheckoutPage'

// mismo criterio que useCart.test.ts: se mockea nuestra propia capa de servicios (*.api.ts),
// no el SDK de Firebase función por función — en este entorno Firestore/Auth no pasan por
// MSW (ver bitácora del hito), así que este es el único límite seguro para no pegarle a
// servicios reales (ni leer ni, más grave todavía, escribir una orden real)
vi.mock('@/modules/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockCustomerUser, loading: false }),
}))

vi.mock('@/modules/products/services/products.api', () => ({
  getProducts: vi.fn().mockResolvedValue([mockProduct]),
}))

vi.mock('@/modules/cart/services/cart.api', () => ({
  getCart: vi.fn().mockResolvedValue({ items: [] }),
  setCart: vi.fn().mockResolvedValue(undefined),
}))

const createOrderMock = vi.fn().mockResolvedValue('order-123')
vi.mock('@/modules/orders/services/orders.api', () => ({
  createOrder: (input: unknown) => createOrderMock(input),
}))

const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

// agrega el producto de prueba al carrito (vía CartContext real) y recién ahí monta
// CheckoutPage — simula "agregar al carrito" sin depender del catálogo/ProductCard completos
function AddToCartThenCheckout() {
  const { addItem, itemCount } = useCart()

  useEffect(() => {
    if (itemCount === 0) addItem(mockProduct.id)
  }, [itemCount, addItem])

  if (itemCount === 0) return null
  return <CheckoutPage />
}

describe('flujo agregar al carrito → checkout', () => {
  it('agrega un producto al carrito y confirma la orden en checkout', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <CartProvider>
          <AddToCartThenCheckout />
        </CartProvider>
      </MemoryRouter>
    )

    // el resumen de checkout debe mostrar el producto que se agregó al carrito
    await waitFor(() => {
      expect(screen.getByText(mockProduct.name, { exact: false })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /confirmar orden/i }))

    await waitFor(() => {
      expect(createOrderMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockCustomerUser.uid,
          items: [expect.objectContaining({ productId: mockProduct.id, quantity: 1 })],
        })
      )
    })

    // tras confirmar, redirige al detalle de la orden recién creada
    expect(navigateMock).toHaveBeenCalledWith('/orders/order-123')
  })
})
