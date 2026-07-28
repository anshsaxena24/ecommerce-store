import { useState, useEffect } from 'react'
import { orderService } from '../../services/otherServices'
import StatusBadge from '../../components/StatusBadge'
import styles from './AdminPages.module.css'

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [updating, setUpdating] = useState(null)
  const [error, setError] = useState('')

  const fetchOrders = () => {
    setLoading(true)
    orderService.getAllOrders({ page, size: 20 })
      .then(data => { setOrders(data.content); setTotalPages(data.totalPages) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [page])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId)
    setError('')
    try {
      const updated = await orderService.updateOrderStatus(orderId, newStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>All Orders</h1>
          <span className="text-secondary" style={{ fontSize: '0.9375rem' }}>
            {orders.length} shown
          </span>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? <div className="loading">Loading orders…</div> : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className={styles.idCell}>#{order.id}</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500 }}>{order.userEmail}</div>
                        {order.shippingAddress && (
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            {order.shippingAddress.city}, {order.shippingAddress.country}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {new Date(order.orderedAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                    <td>{order.items?.length || 0}</td>
                    <td style={{ fontWeight: 600 }}>${order.total.toFixed(2)}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>
                      <select
                        className="form-input"
                        style={{ fontSize: '0.8125rem', padding: '0.375rem 2rem 0.375rem 0.5rem', maxWidth: 140 }}
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        disabled={updating === order.id}
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
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
              <button
                key={i}
                className={`btn btn-outline btn-sm ${i === page ? styles.activePage : ''}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
