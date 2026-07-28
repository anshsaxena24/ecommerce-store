import api from './api'

export const orderService = {
  placeOrder: (data) => api.post('/orders', data).then(r => r.data),
  getOrders: (params) => api.get('/orders', { params }).then(r => r.data),
  getOrder: (id) => api.get(`/orders/${id}`).then(r => r.data),
  getAllOrders: (params) => api.get('/orders/all', { params }).then(r => r.data),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }).then(r => r.data),
}

export const categoryService = {
  getCategories: () => api.get('/categories').then(r => r.data),
  getProductsByCategory: (slug, params) => api.get(`/categories/${slug}/products`, { params }).then(r => r.data),
}

export const addressService = {
  getAddresses: () => api.get('/addresses').then(r => r.data),
  addAddress: (data) => api.post('/addresses', data).then(r => r.data),
  updateAddress: (id, data) => api.put(`/addresses/${id}`, data).then(r => r.data),
  deleteAddress: (id) => api.delete(`/addresses/${id}`).then(r => r.data),
}

export const reviewService = {
  getReviews: (productId) => api.get(`/products/${productId}/reviews`).then(r => r.data),
  addReview: (productId, data) => api.post(`/products/${productId}/reviews`, data).then(r => r.data),
}

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard/stats').then(r => r.data),
}
