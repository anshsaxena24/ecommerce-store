import ProductCard from './ProductCard'
import styles from './ProductGrid.module.css'

export default function ProductGrid({ products, loading }) {
  if (loading) return <div className="loading">Loading products…</div>
  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <h3>No products found</h3>
        <p>Try adjusting your filters or search terms.</p>
      </div>
    )
  }
  return (
    <div className={styles.grid}>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
