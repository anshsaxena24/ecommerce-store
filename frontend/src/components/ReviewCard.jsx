import StarRating from './StarRating'
import styles from './ReviewCard.module.css'

export default function ReviewCard({ review }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.name}>{review.userName}</span>
        <StarRating rating={review.rating} size="sm" />
        <span className={styles.date}>
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      {review.comment && <p className={styles.comment}>{review.comment}</p>}
    </div>
  )
}
