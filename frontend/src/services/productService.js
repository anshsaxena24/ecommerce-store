import api from './api'

const productService = {
  getProducts: (params) => api.get('/products', { params }).then(r => r.data),
  getProduct: (id) => api.get(`/products/${id}`).then(r => r.data),
  searchProducts: (q, params) => api.get('/products/search', { params: { q, ...params } }).then(r => r.data),
  createProduct: (data) => api.post('/products', data).then(r => r.data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data).then(r => r.data),
  deleteProduct: (id) => api.delete(`/products/${id}`).then(r => r.data),
}

export default productService
