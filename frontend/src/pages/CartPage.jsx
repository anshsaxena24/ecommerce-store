import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import styles from './CartPage.module.css'

export default function CartPage() {
  const { cart, updateQty, removeItem } = useContext(CartContext)
  const navigate = useNavigate()

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className={styles.page}>
        <div className="container">
          <h1 className="page-title">Your Cart</h1>
          <div className="empty-state">
            <h3>Your cart is empty</h3>
            <p>Add some products to get started.</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const shipping = 5.99
  const total = (cart.subtotal || 0) + shipping

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className="page-title">Your Cart ({cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''})</h1>

        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.items}>
            <div className={styles.tableHeader}>
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
              <span></span>
            </div>

            {cart.items.map(item => (
              <div key={item.cartItemId} className={styles.row}>
                <div className={styles.productCell}>
                  <Link to={`/products/${item.productId}`}>
                    <img
                      src={item.primaryImageUrl || 'https://via.placeholder.com/80x80?text=No+Image'}
                      alt={item.productName}
                      className={styles.thumb}
                    />
                  </Link>
                  <div>
                    <Link to={`/products/${item.productId}`} className={styles.productName}>
                      {item.productName}
                    </Link>
                    {item.stockQuantity < item.quantity && (
                      <p className={styles.stockWarn}>Only {item.stockQuantity} in stock</p>
                    )}
                  </div>
                </div>

                <span className={styles.price}>${item.price.toFixed(2)}</span>

                <div className={styles.qtyControl}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQty(item.cartItemId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className={styles.qtyVal}>{item.quantity}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQty(item.cartItemId, item.quantity + 1)}
                    disabled={item.quantity >= item.stockQuantity}
                  >
                    +
                  </button>
                </div>

                <span className={styles.itemTotal}>${item.itemTotal.toFixed(2)}</span>

                <button
                  className={styles.removeBtn}
                  onClick={() => removeItem(item.cartItemId)}
                  title="Remove item"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            <div className={styles.summaryLines}>
              <div className={styles.summaryLine}>
                <span>Subtotal</span>
                <span>${(cart.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className={`${styles.summaryLine} ${styles.totalLine}`}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>

            <Link to="/products" className={styles.continueShopping}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
