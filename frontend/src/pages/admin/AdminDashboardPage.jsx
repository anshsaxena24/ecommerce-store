import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { adminService } from '../../services/otherServices'
import styles from './AdminPages.module.css'

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  SHIPPED: '#8b5cf6',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading dashboard…</div>
  if (!stats) return null

  const chartData = Object.entries(stats.ordersByStatus || {}).map(([status, count]) => ({
    status,
    count,
    fill: STATUS_COLORS[status] || '#6b7280',
  }))

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className="page-title">Admin Dashboard</h1>

        <div className={styles.statGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#dbeafe', color: '#1d4ed8' }}>📦</div>
            <div>
              <p className={styles.statLabel}>Total Products</p>
              <p className={styles.statValue}>{stats.totalProducts.toLocaleString()}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#d1fae5', color: '#065f46' }}>🛒</div>
            <div>
              <p className={styles.statLabel}>Total Orders</p>
              <p className={styles.statValue}>{stats.totalOrders.toLocaleString()}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#ede9fe', color: '#5b21b6' }}>👥</div>
            <div>
              <p className={styles.statLabel}>Total Users</p>
              <p className={styles.statValue}>{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#fef3c7', color: '#92400e' }}>💰</div>
            <div>
              <p className={styles.statLabel}>Total Revenue</p>
              <p className={styles.statValue}>${(stats.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Orders by Status</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="status" tick={{ fontSize: 13 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                <Tooltip
                  formatter={(value) => [value, 'Orders']}
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted" style={{ padding: '2rem', textAlign: 'center' }}>No order data yet.</p>
          )}
        </div>

        <div className={styles.quickLinks}>
          <h2 className={styles.chartTitle}>Quick Links</h2>
          <div className={styles.linkGrid}>
            <Link to="/admin/products" className={styles.quickLink}>
              <span className={styles.qlIcon}>📦</span>
              <div>
                <strong>Manage Products</strong>
                <p>Add, edit, or remove products</p>
              </div>
            </Link>
            <Link to="/admin/orders" className={styles.quickLink}>
              <span className={styles.qlIcon}>🛒</span>
              <div>
                <strong>Manage Orders</strong>
                <p>View and update order statuses</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
