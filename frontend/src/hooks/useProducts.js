import { useState, useEffect, useCallback } from 'react'
import productService from '../services/productService'

export function useProducts(initialParams = {}) {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ totalPages: 0, totalElements: 0, number: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [params, setParams] = useState({ page: 0, size: 12, ...initialParams })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await productService.getProducts(params)
      setProducts(data.content)
      setPagination({ totalPages: data.totalPages, totalElements: data.totalElements, number: data.number })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const updateParams = (newParams) => setParams(prev => ({ ...prev, ...newParams, page: 0 }))
  const setPage = (page) => setParams(prev => ({ ...prev, page }))

  return { products, pagination, loading, error, params, updateParams, setPage }
}
