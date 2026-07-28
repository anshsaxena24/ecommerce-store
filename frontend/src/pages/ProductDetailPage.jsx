import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import productService from '../services/productService'
import { reviewService } from '../services/otherServices'
import { CartContext } from '../context/CartContext'
import { useAuth } from '../hooks/useAuth'
import StarRating from '../components/StarRating'
import ReviewCard from '../components/ReviewCard'
import styles from './ProductDetailPage.module.css'

const reviewSchema = yup.object({
  rating: yup.number().min(1).max(5).required('Rating is required'),
  comment: yup.string(),
})

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useContext(CartContext)
  const { token } = useAuth()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [selectedImg, setSelectedImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [addMsg, setAddMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(reviewSchema),
    defaultValues: { rating: 5, comment: '' }
  })

  useEffect(() => {
    setLoading(true)
    Promise.all([
      productService.getProduct(id),
      reviewService.getReviews(id),
    ]).then(([prod, revs]) => {
      setProduct(prod)
      setReviews(revs)
    }).catch(() => navigate('/products'))
     .finally(() => setLoading(false))
  }, [id, navigate])

  const handleAddToCart = async () => {
    if (!token) { navigate('/login'); return }
    try {
      await addToCart(product.id, qty)
      setAddMsg('Added to cart!')
      setTimeout(() => setAddMsg(''), 2500)
    } catch (err) {
      setAddMsg(err.response?.data?.message || 'Failed to add to cart')
    }
  }

  const onReviewSubmit = async (data) => {
    setReviewError('')
    try {
      const newReview = await reviewService.addReview(id, { ...data, rating: Number(data.rating) })
      setReviews(prev => [newReview, ...prev])
      setReviewSuccess(true)
      reset()
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review')
    }
  }

  if (loading) return <div className="loading">Loading product…</div>
  if (!product) return null

  const images = product.imageUrls?.length ? product.imageUrls : ['https://via.placeholder.com/600x600?text=No+Image']

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <a href="/products">Products</a>
          <span>/</span>
          <a href={`/products?categoryId=${product.categoryId}`}>{product.categoryName}</a>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className={styles.detail}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImg}>
              <img src={images[selectedImg]} alt={product.name} />
            </div>
            {images.length > 1 && (
              <div className={styles.thumbs}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${i === selectedImg ? styles.activeThumb : ''}`}
                    onClick={() => setSelectedImg(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.info}>
            <p className={styles.category}>{product.categoryName}</p>
            <h1 className={styles.name}>{product.name}</h1>

            <div className={styles.ratingRow}>
              {product.averageRating ? (
                <>
                  <StarRating rating={product.averageRating} size="md" />
                  <span className={styles.ratingNum}>{product.averageRating.toFixed(1)}</span>
                  <span className={styles.ratingCount}>({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})</span>
                </>
              ) : (
                <span className="text-muted">No reviews yet</span>
              )}
            </div>

            <p className={styles.price}>${product.price.toFixed(2)}</p>

            <div className={styles.stock}>
              {product.stockQuantity > 0 ? (
                <span className={styles.inStock}>✓ In Stock ({product.stockQuantity} available)</span>
              ) : (
                <span className={styles.outOfStock}>✗ Out of Stock</span>
              )}
            </div>

            <p className={styles.description}>{product.description}</p>

            {product.stockQuantity > 0 && (
              <div className={styles.addToCart}>
                <div className={styles.qtyControl}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className={styles.qtyBtn}>−</button>
                  <span className={styles.qtyVal}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stockQuantity, q + 1))} className={styles.qtyBtn}>+</button>
                </div>
                <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                  Add to Cart
                </button>
              </div>
            )}

            {addMsg && (
              <div className={`alert ${addMsg.includes('Failed') ? 'alert-error' : 'alert-success'}`}>
                {addMsg}
              </div>
            )}

            <div className={styles.meta}>
              <p><strong>Category:</strong> {product.categoryName}</p>
              <p><strong>SKU:</strong> PROD-{String(product.id).padStart(5, '0')}</p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className={styles.reviews}>
          <h2 className={styles.reviewsTitle}>Customer Reviews</h2>

          {token && !reviewSuccess && (
            <div className={styles.reviewForm}>
              <h3>Write a Review</h3>
              {reviewError && <div className="alert alert-error">{reviewError}</div>}
              <form onSubmit={handleSubmit(onReviewSubmit)}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <select {...register('rating')} className="form-input" style={{ maxWidth: 160 }}>
                    <option value={5}>★★★★★ (5/5)</option>
                    <option value={4}>★★★★☆ (4/5)</option>
                    <option value={3}>★★★☆☆ (3/5)</option>
                    <option value={2}>★★☆☆☆ (2/5)</option>
                    <option value={1}>★☆☆☆☆ (1/5)</option>
                  </select>
                  {errors.rating && <span className="form-error">{errors.rating.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Comment (optional)</label>
                  <textarea {...register('comment')} className="form-input" rows={3} placeholder="Share your experience…" style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {reviewSuccess && (
            <div className="alert alert-success">Thanks for your review!</div>
          )}

          {!token && (
            <p className={styles.loginPrompt}>
              <a href="/login" style={{ color: 'var(--primary)' }}>Sign in</a> to write a review.
            </p>
          )}

          <div className={styles.reviewList}>
            {reviews.length === 0 ? (
              <p className="text-secondary">No reviews yet. Be the first!</p>
            ) : (
              reviews.map(r => <ReviewCard key={r.id} review={r} />)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
