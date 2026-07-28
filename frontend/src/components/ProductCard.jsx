import { Link } from 'react-router-dom'
import { useContext } from 'react'
import { CartContext } from '../context/CartContext'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import StarRating from './StarRating'
import styles from './ProductCard.module.css'

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext)
  const { token } = useAuth()
  const navigate = useNavigate()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!token) { navigate('/login'); return }
    try {
      await addToCart(product.id, 1)
    } catch (err) {
      console.error('Add to cart failed', err)
    }
  }

  const img = product.primaryImageUrl || product.imageUrls?.[0] || 'https://via.placeholder.com/300x300?text=No+Image'

  return (
    <Link to={`/products/${product.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={img} alt={product.name} className={styles.image} loading="lazy" />
        {product.stockQuantity === 0 && (
          <span className={styles.outOfStock}>Out of Stock</span>
        )}
      </div>
      <div className={styles.body}>
        <p className={styles.category}>{product.categoryName}</p>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.rating}>
          {product.averageRating ? (
            <>
              <StarRating rating={product.averageRating} size="sm" />
              <span className={styles.ratingText}>({product.reviewCount})</span>
            </>
          ) : (
            <span className={styles.noRating}>No reviews yet</span>
          )}
        </div>
        <div className={styles.footer}>
          <span className={styles.price}>${product.price.toFixed(2)}</span>
          <button
            className={styles.addBtn}
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  )
}
