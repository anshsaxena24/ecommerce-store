import { createContext, useState, useCallback, useContext, useEffect } from 'react'
import cartService from '../services/cartService'
import { AuthContext } from './AuthContext'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { token } = useContext(AuthContext)
  const [cart, setCart] = useState({ items: [], subtotal: 0, totalItems: 0 })
  const [cartLoading, setCartLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!token) { setCart({ items: [], subtotal: 0, totalItems: 0 }); return }
    setCartLoading(true)
    try {
      const data = await cartService.getCart()
      setCart(data)
    } catch {
      // ignore
    } finally {
      setCartLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = async (productId, quantity = 1) => {
    const data = await cartService.addItem({ productId, quantity })
    setCart(data)
    return data
  }

  const updateQty = async (cartItemId, quantity) => {
    const data = await cartService.updateItem(cartItemId, { quantity })
    setCart(data)
  }

  const removeItem = async (cartItemId) => {
    const data = await cartService.removeItem(cartItemId)
    setCart(data)
  }

  const clearCart = () => {
    setCart({ items: [], subtotal: 0, totalItems: 0 })
  }

  return (
    <CartContext.Provider value={{ cart, cartLoading, fetchCart, addToCart, updateQty, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}
