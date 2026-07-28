import { useState, useEffect } from 'react'
import { categoryService } from '../services/otherServices'
import styles from './FilterSidebar.module.css'

export default function FilterSidebar({ params, onUpdate }) {
  const [categories, setCategories] = useState([])
  const [minPrice, setMinPrice] = useState(params.minPrice || '')
  const [maxPrice, setMaxPrice] = useState(params.maxPrice || '')

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

  const handlePriceApply = () => {
    onUpdate({
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    })
  }

  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.title}>Filters</h3>

      <div className={styles.section}>
        <label className={styles.label}>Category</label>
        <select
          className="form-input"
          value={params.categoryId || ''}
          onChange={e => onUpdate({ categoryId: e.target.value || undefined })}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.indent ? '  └ ' : ''}{c.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Price Range</label>
        <div className={styles.priceRow}>
          <input
            type="number"
            placeholder="Min"
            className="form-input"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            min="0"
          />
          <span>–</span>
          <input
            type="number"
            placeholder="Max"
            className="form-input"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            min="0"
          />
        </div>
        <button className={`btn btn-outline btn-sm ${styles.applyBtn}`} onClick={handlePriceApply}>
          Apply Price
        </button>
      </div>

      <div className={styles.section}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={params.inStock === 'true' || params.inStock === true}
            onChange={e => onUpdate({ inStock: e.target.checked ? true : undefined })}
          />
          In Stock Only
        </label>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Sort By</label>
        <select
          className="form-input"
          value={params.sort || ''}
          onChange={e => onUpdate({ sort: e.target.value || undefined })}
        >
          <option value="">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <button
        className="btn btn-outline btn-sm"
        onClick={() => onUpdate({ categoryId: undefined, minPrice: undefined, maxPrice: undefined, inStock: undefined, sort: undefined })}
      >
        Clear All Filters
      </button>
    </aside>
  )
}
