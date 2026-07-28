import styles from './StatusBadge.module.css'

const STATUS_COLORS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

export default function StatusBadge({ status }) {
  const colorClass = STATUS_COLORS[status] || 'pending'
  return (
    <span className={`${styles.badge} ${styles[colorClass]}`}>
      {status}
    </span>
  )
}
