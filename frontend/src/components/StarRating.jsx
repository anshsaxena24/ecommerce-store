import styles from './StarRating.module.css'

export default function StarRating({ rating, size = 'md' }) {
  const stars = []
  const rounded = Math.round(rating * 2) / 2
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) stars.push('full')
    else if (i - 0.5 === rounded) stars.push('half')
    else stars.push('empty')
  }
  return (
    <span className={`${styles.stars} ${styles[size]}`} aria-label={`${rating} out of 5 stars`}>
      {stars.map((type, i) => (
        <span key={i} className={type === 'full' ? styles.full : type === 'half' ? styles.half : styles.empty}>
          {type === 'full' ? '★' : type === 'half' ? '⯨' : '☆'}
        </span>
      ))}
    </span>
  )
}
