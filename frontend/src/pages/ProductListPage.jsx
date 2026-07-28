import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import ProductGrid from '../components/ProductGrid'
import FilterSidebar from '../components/FilterSidebar'
import Pagination from '../components/Pagination'
import productService from '../services/productService'
import { useState } from 'react'
import styles from './ProductListPage.module.css'

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchResults, setSearchResults] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)

  const q = searchParams.get('q')

  const initialParams = {
    page: parseInt(searchParams.get('page') || '0'),
    size: 12,
    sort: searchParams.get('sort') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    minPrice: searchParams.get('minPrice') || undefined,
    maxPrice: searchParams.get('maxPrice') || undefined,
    inStock: searchParams.get('inStock') || undefined,
  }

  const { products, pagination, loading, params, updateParams, setPage } = useProducts(initialParams)

  // Handle search query
  useEffect(() => {
    if (!q) { setSearchResults(null); return }
    setSearchLoading(true)
    productService.searchProducts(q, { page: 0, size: 12 })
      .then(data => setSearchResults(data))
      .finally(() => setSearchLoading(false))
  }, [q])

  const handleFilterUpdate = (updates) => {
    const newParams = { ...params, ...updates, page: 0 }
    updateParams(updates)
    const sp = new URLSearchParams()
    Object.entries(newParams).forEach(([k, v]) => { if (v !== undefined && v !== '') sp.set(k, v) })
    setSearchParams(sp)
  }

  const handlePageChange = (page) => {
    setPage(page)
    const sp = new URLSearchParams(searchParams)
    sp.set('page', page)
    setSearchParams(sp)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const displayProducts = q ? (searchResults?.content || []) : products
  const displayLoading = q ? searchLoading : loading
  const displayPagination = q ? (searchResults || pagination) : pagination

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className="page-title">
            {q ? `Search results for "${q}"` : 'All Products'}
          </h1>
          {!q && (
            <p className={styles.count}>
              {pagination.totalElements} product{pagination.totalElements !== 1 ? 's' : ''}
            </p>
          )}
          {q && searchResults && (
            <p className={styles.count}>
              {searchResults.totalElements} result{searchResults.totalElements !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className={styles.layout}>
          {!q && (
            <FilterSidebar params={params} onUpdate={handleFilterUpdate} />
          )}
          <div className={styles.main}>
            <ProductGrid products={displayProducts} loading={displayLoading} />
            <Pagination
              currentPage={displayPagination.number || 0}
              totalPages={displayPagination.totalPages || 0}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
