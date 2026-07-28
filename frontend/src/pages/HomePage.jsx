import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import productService from '../services/productService'
import { categoryService } from '../services/otherServices'
import ProductGrid from '../components/ProductGrid'
import styles from './HomePage.module.css'

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productService.getProducts({ page: 0, size: 8 }),
      categoryService.getCategories(),
    ]).then(([products, cats]) => {
      setFeatured(products.content)
      setCategories(cats.filter(c => !c.parentId).slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const CATEGORY_ICONS = {
    'electronics': '💻',
    'clothing': '👕',
    'books': '📚',
    'home-garden': '🏡',
    'sports': '🏋️',
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Shop Everything You Love</h1>
          <p className={styles.heroSub}>
            Discover thousands of products across electronics, clothing, books, home goods, and more.
            Fast shipping, great prices, no compromise.
          </p>
          <div className={styles.heroBtns}>
            <Link to="/products" className="btn btn-primary btn-lg">Shop Now</Link>
            <Link to="/products?categoryId=" className={`btn btn-outline btn-lg ${styles.heroOutline}`}>
              Browse Categories
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroImageGrid}>
            <div className={styles.heroImg} style={{ background: 'linear-gradient(135deg, #dbeafe, #eff6ff)' }}>📱</div>
            <div className={styles.heroImg} style={{ background: 'linear-gradient(135deg, #fce7f3, #fdf2f8)' }}>👟</div>
            <div className={styles.heroImg} style={{ background: 'linear-gradient(135deg, #d1fae5, #ecfdf5)' }}>📚</div>
            <div className={styles.heroImg} style={{ background: 'linear-gradient(135deg, #fef3c7, #fffbeb)' }}>🎧</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <div className={styles.categoryGrid}>
            {categories.map(cat => (
              <Link key={cat.id} to={`/categories/${cat.slug}/products`} className={styles.categoryCard}>
                <span className={styles.categoryIcon}>{CATEGORY_ICONS[cat.slug] || '🛍️'}</span>
                <span className={styles.categoryName}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Products</h2>
            <Link to="/products" className={styles.viewAll}>View all →</Link>
          </div>
          <ProductGrid products={featured} loading={loading} />
        </div>
      </section>

      {/* Banner */}
      <section className={styles.banner}>
        <div className="container">
          <div className={styles.bannerInner}>
            <div>
              <h2 className={styles.bannerTitle}>Free Shipping on Orders Over $50</h2>
              <p className={styles.bannerSub}>Plus flat-rate $5.99 shipping on everything else. Fast, reliable delivery every time.</p>
            </div>
            <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
