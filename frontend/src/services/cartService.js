import api from './api'

const cartService = {
  getCart: () => api.get('/cart').then(r => r.data),
  addItem: (data) => api.post('/cart/items', data).then(r => r.data),
  updateItem: (cartItemId, data) => api.patch(`/cart/items/${cartItemId}`, data).then(r => r.data),
  removeItem: (cartItemId) => api.delete(`/cart/items/${cartItemId}`).then(r => r.data),
  clearCart: () => api.delete('/cart').then(r => r.data),
}

export default cartService
