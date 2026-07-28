import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useAuth'
import { CartContext } from '../context/CartContext'
import { useContext } from 'react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { cart } = useContext(CartContext)
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/products?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const itemCount = cart?.totalItems || 0

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>ShopZone</Link>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>🔍</button>
        </form>

        <div className={styles.links}>
          <Link to="/products" className={styles.link}>Products</Link>

          {user ? (
            <>
              <Link to="/orders" className={styles.link}>My Orders</Link>
              {isAdmin && <Link to="/admin" className={styles.adminLink}>Admin</Link>}
              <Link to="/cart" className={styles.cartBtn}>
                🛒 Cart
                {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
              </Link>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout ({user.firstName})
              </button>
            </>
          ) : (
            <>
              <Link to="/cart" className={styles.cartBtn}>
                🛒 Cart
                {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
              </Link>
              <Link to="/login" className={styles.loginBtn}>Login</Link>
              <Link to="/register" className={`${styles.loginBtn} ${styles.registerBtn}`}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
