/* src/components/FeedbackSection/FeedbackSection.jsx */
import React from 'react';
import styles from './FeedbackSection.module.css';

// SVG Star Component
const Star = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const FeedbackSection = ({ reviews }) => {
  // Don't render anything if there are no reviews yet
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Citizen Feedback</h3>
      </div>

      <div className={styles.scrollContainer}>
        {reviews.map((review) => (
          <div key={review.id} className={styles.card}>
            
            {/* 5-Star Display */}
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map(num => (
                <Star key={num} filled={num <= review.rating} />
              ))}
            </div>

            {/* User Info & Verified Badge */}
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {review.user_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className={styles.userName}>{review.user_name}</p>
                <span className={styles.verifiedBadge}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Verified
                </span>
              </div>
            </div>

            {/* Comment Body */}
            <p className={styles.comment}>
              {review.comment ? `"${review.comment}"` : "Rated without comment."}
            </p>

            <div className={styles.date}>
              {new Date(review.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackSection;