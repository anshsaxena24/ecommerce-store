import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { orderService } from '../services/otherServices'
import StatusBadge from '../components/StatusBadge'
import styles from './OrderPages.module.css'

export function OrderConfirmationPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getOrder(id)
      .then(setOrder)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading">Loading order…</div>

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.confirmation}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.confirmTitle}>Order Placed Successfully!</h1>
          <p className={styles.confirmSub}>
            Thank you for your order. Your order #{order?.id} has been received and is being processed.
          </p>

          {order && (
            <div className={styles.confirmCard}>
              <div className={styles.confirmRow}>
                <span>Order Number</span>
                <strong>#{order.id}</strong>
              </div>
              <div className={styles.confirmRow}>
                <span>Status</span>
                <StatusBadge status={order.status} />
              </div>
              <div className={styles.confirmRow}>
                <span>Total</span>
                <strong>${order.total.toFixed(2)}</strong>
              </div>
              {order.shippingAddress && (
                <div className={styles.confirmRow}>
                  <span>Ship to</span>
                  <span>{order.shippingAddress.street}, {order.shippingAddress.city}</span>
                </div>
              )}
            </div>
          )}

          <div className={styles.confirmBtns}>
            <Link to={`/orders/${id}`} className="btn btn-primary">View Order Details</Link>
            <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    setLoading(true)
    orderService.getOrders({ page, size: 10 })
      .then(data => {
        setOrders(data.content)
        setTotalPages(data.totalPages)
      })
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className="page-title">My Orders</h1>

        {loading && <div className="loading">Loading orders…</div>}

        {!loading && orders.length === 0 && (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>When you place an order, it'll show up here.</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>Start Shopping</Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <>
            <div className={styles.orderList}>
              {orders.map(order => (
                <Link key={order.id} to={`/orders/${order.id}`} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div>
                      <span className={styles.orderId}>Order #{order.id}</span>
                      <span className={styles.orderDate}>
                        {new Date(order.orderedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className={styles.orderMeta}>
                    <span>{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</span>
                    <strong className={styles.orderTotal}>${order.total.toFixed(2)}</strong>
                  </div>
                  <div className={styles.orderItems}>
                    {order.items?.slice(0, 3).map(item => (
                      <span key={item.id} className={styles.itemChip}>
                        {item.productName} × {item.quantity}
                      </span>
                    ))}
                    {(order.items?.length || 0) > 3 && (
                      <span className={styles.itemChip}>+{order.items.length - 3} more</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} className={`btn btn-outline btn-sm ${i === page ? 'btn-primary' : ''}`} onClick={() => setPage(i)}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getOrder(id).then(setOrder).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading">Loading order…</div>
  if (!order) return <div className="empty-state"><h3>Order not found</h3></div>

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.detailHeader}>
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Order #{order.id}</h1>
            <p className="text-secondary">
              Placed on {new Date(order.orderedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className={styles.detailGrid}>
          {/* Items */}
          <div className={styles.detailCard}>
            <h2 className={styles.cardTitle}>Items Ordered</h2>
            {order.items?.map(item => (
              <div key={item.id} className={styles.detailItem}>
                <img
                  src={item.primaryImageUrl || 'https://via.placeholder.com/64x64?text=No+Img'}
                  alt={item.productName}
                  className={styles.detailThumb}
                />
                <div className={styles.detailItemInfo}>
                  <Link to={`/products/${item.productId}`} className={styles.detailItemName}>
                    {item.productName}
                  </Link>
                  <span className="text-secondary">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</span>
                </div>
                <strong>${item.itemTotal.toFixed(2)}</strong>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Summary */}
            <div className={styles.detailCard}>
              <h2 className={styles.cardTitle}>Order Summary</h2>
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
                <div className={styles.summaryRow}><span>Shipping</span><span>${order.shippingCost.toFixed(2)}</span></div>
                <div className={`${styles.summaryRow} ${styles.totalRow}`}><span>Total</span><strong>${order.total.toFixed(2)}</strong></div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className={styles.detailCard}>
                <h2 className={styles.cardTitle}>Shipping Address</h2>
                <div className={styles.addrBlock}>
                  <strong>{order.shippingAddress.fullName}</strong>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Link to="/orders" className={styles.backLink}>← Back to Orders</Link>
      </div>
    </div>
  )
}
