import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import productService from '../../services/productService'
import { categoryService } from '../../services/otherServices'
import styles from './AdminPages.module.css'

const BLANK = { name: '', description: '', price: '', stockQuantity: '', categoryId: '', isActive: true, imageUrls: '' }

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: BLANK })

  const fetchProducts = () => {
    setLoading(true)
    productService.getProducts({ page, size: 15 })
      .then(data => { setProducts(data.content); setTotalPages(data.totalPages) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [page])

  useEffect(() => {
    categoryService.getCategories().then(cats => {
      const flat = []
      cats.forEach(c => {
        flat.push(c)
        if (c.children) c.children.forEach(ch => flat.push({ ...ch, indent: true }))
      })
      setCategories(flat)
    })
  }, [])

  const openCreate = () => { setEditing(null); reset(BLANK); setShowForm(true); setError(''); setSuccess('') }

  const openEdit = (p) => {
    setEditing(p)
    reset({
      name: p.name,
      description: p.description,
      price: p.price,
      stockQuantity: p.stockQuantity,
      categoryId: p.categoryId || '',
      isActive: p.isActive,
      imageUrls: p.imageUrls?.join('\n') || '',
    })
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const onSubmit = async (data) => {
    setError('')
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        stockQuantity: parseInt(data.stockQuantity),
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        imageUrls: data.imageUrls ? data.imageUrls.split('\n').map(s => s.trim()).filter(Boolean) : [],
      }
      if (editing) {
        await productService.updateProduct(editing.id, payload)
        setSuccess('Product updated successfully.')
      } else {
        await productService.createProduct(payload)
        setSuccess('Product created successfully.')
      }
      setShowForm(false)
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this product?')) return
    try {
      await productService.deleteProduct(id)
      setSuccess('Product deactivated.')
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product')
    }
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Products</h1>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Form Modal */}
        {showForm && (
          <div className={styles.modal}>
            <div className={styles.modalBox}>
              <div className={styles.modalHeader}>
                <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setShowForm(false)} className={styles.closeBtn}>×</button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className={styles.modalForm}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input {...register('name', { required: 'Required' })} className={`form-input ${errors.name ? 'error' : ''}`} />
                  {errors.name && <span className="form-error">{errors.name.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea {...register('description')} className="form-input" rows={3} style={{ resize: 'vertical' }} />
                </div>
                <div className={styles.formRow}>
                  <div className="form-group">
                    <label className="form-label">Price *</label>
                    <input {...register('price', { required: 'Required' })} type="number" step="0.01" min="0" className={`form-input ${errors.price ? 'error' : ''}`} />
                    {errors.price && <span className="form-error">{errors.price.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock *</label>
                    <input {...register('stockQuantity', { required: 'Required' })} type="number" min="0" className={`form-input ${errors.stockQuantity ? 'error' : ''}`} />
                    {errors.stockQuantity && <span className="form-error">{errors.stockQuantity.message}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select {...register('categoryId')} className="form-input">
                    <option value="">— None —</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.indent ? '  └ ' : ''}{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Image URLs (one per line)</label>
                  <textarea {...register('imageUrls')} className="form-input" rows={3} placeholder="https://..." style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                  <input {...register('isActive')} type="checkbox" id="isActive" style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
                  <label htmlFor="isActive" className="form-label" style={{ marginBottom: 0 }}>Active (visible in store)</label>
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : editing ? 'Update Product' : 'Create Product'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? <div className="loading">Loading…</div> : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td className={styles.idCell}>#{p.id}</td>
                    <td>
                      <div className={styles.productCell}>
                        {p.primaryImageUrl && (
                          <img src={p.primaryImageUrl} alt={p.name} className={styles.productThumb} />
                        )}
                        <span className={styles.productName}>{p.name}</span>
                      </div>
                    </td>
                    <td>{p.categoryName || '—'}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>{p.stockQuantity}</td>
                    <td>
                      <span className={p.isActive ? styles.activeTag : styles.inactiveTag}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={`btn btn-outline btn-sm ${i === page ? styles.activePage : ''}`} onClick={() => setPage(i)}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
