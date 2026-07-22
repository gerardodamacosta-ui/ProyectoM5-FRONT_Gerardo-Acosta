import { cartReducer } from './cartReducer'
import type { CartItem } from '@/modules/cart/types/cart.types'

describe('cartReducer', () => {
  it('ADD_ITEM agrega un producto nuevo con la cantidad indicada', () => {
    const state: CartItem[] = []
    const result = cartReducer(state, {
      type: 'ADD_ITEM',
      payload: { productId: 'p1', quantity: 1 },
    })
    expect(result).toEqual([{ productId: 'p1', quantity: 1 }])
  })

  it('ADD_ITEM suma la cantidad si el producto ya está en el carrito', () => {
    const state: CartItem[] = [{ productId: 'p1', quantity: 2 }]
    const result = cartReducer(state, {
      type: 'ADD_ITEM',
      payload: { productId: 'p1', quantity: 3 },
    })
    expect(result).toEqual([{ productId: 'p1', quantity: 5 }])
  })

  it('REMOVE_ITEM saca el producto por completo', () => {
    const state: CartItem[] = [
      { productId: 'p1', quantity: 2 },
      { productId: 'p2', quantity: 1 },
    ]
    const result = cartReducer(state, { type: 'REMOVE_ITEM', payload: { productId: 'p1' } })
    expect(result).toEqual([{ productId: 'p2', quantity: 1 }])
  })

  it('UPDATE_QUANTITY actualiza la cantidad si es mayor a 0', () => {
    const state: CartItem[] = [{ productId: 'p1', quantity: 2 }]
    const result = cartReducer(state, {
      type: 'UPDATE_QUANTITY',
      payload: { productId: 'p1', quantity: 5 },
    })
    expect(result).toEqual([{ productId: 'p1', quantity: 5 }])
  })

  it('UPDATE_QUANTITY remueve el item si la cantidad llega a 0', () => {
    const state: CartItem[] = [{ productId: 'p1', quantity: 2 }]
    const result = cartReducer(state, {
      type: 'UPDATE_QUANTITY',
      payload: { productId: 'p1', quantity: 0 },
    })
    expect(result).toEqual([])
  })

  it('CLEAR_CART vacía el carrito', () => {
    const state: CartItem[] = [{ productId: 'p1', quantity: 2 }]
    const result = cartReducer(state, { type: 'CLEAR_CART' })
    expect(result).toEqual([])
  })

  it('SET_CART reemplaza el array completo', () => {
    const state: CartItem[] = [{ productId: 'p1', quantity: 2 }]
    const newItems: CartItem[] = [{ productId: 'p2', quantity: 7 }]
    const result = cartReducer(state, { type: 'SET_CART', payload: newItems })
    expect(result).toEqual(newItems)
  })
})
