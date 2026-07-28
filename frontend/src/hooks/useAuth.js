import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'

export function useAuth() {
  return useContext(AuthContext)
}

export function useCart() {
  return useContext(CartContext)
}
