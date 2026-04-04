/* src/components/ReviewModal/ReviewModal.jsx */
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './ReviewModal.module.css';

const StarIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ReviewModal = ({ isOpen, onClose, targetId, type, targetName, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✨ RESET STATE ON OPEN/CLOSE
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setComment('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = type === 'event' 
        ? `/events/${targetId}/review/` 
        : `/facilities/${targetId}/review/`;

      await api.post(endpoint, { rating, comment });
      onSuccess(); 
    } catch (err) {
      console.error("Review Error:", err);
      setError(err.response?.data?.error || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.header}>
          <h3 className={styles.title}>Rate your experience</h3>
          <p className={styles.subtitle}>{targetName}</p>
        </div>

        <div className={styles.starContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <div
              key={star}
              className={`${styles.star} ${star <= (hoverRating || rating) ? styles.active : ''}`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <StarIcon />
            </div>
          ))}
        </div>

        <textarea
          className={styles.textarea}
          placeholder="Tell us about your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {/* Updated Error Style */}
        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.actionRow}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button 
            className={styles.submitBtn} 
            onClick={handleSubmit} 
            disabled={loading || rating === 0}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;