/* src/components/common/RegistrationCard.jsx */
import React from 'react';
import styles from './RegistrationCard.module.css';

const RegistrationCard = ({ registration, onOpenReview }) => {
  // Extract can_review from our new backend logic
  const { event, attended_at, id, can_review } = registration;

  // Format Full Date for Event
  const formatDateTime = (dateStr, timeStr) => {
    try {
      const date = new Date(`${dateStr}T${timeStr}`);
      return date.toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit'
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Format Check-In Time
  const formatAttendedTime = (dateTimeStr) => {
     try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('en-US', {
        hour: 'numeric', minute: '2-digit'
      });
    } catch (e) {
      return "--:--";
    }
  }

  return (
    <div className={`${styles.card} ${attended_at ? styles.checkedIn : styles.pending}`}>
      
      {/* --- INFO SECTION --- */ }
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{event.title}</h3>
        
        <div className={styles.cardMeta}>
          <span className={styles.metaItem}>📅 {formatDateTime(event.date, event.time)}</span>
          <span className={styles.metaItem}>📍 {event.location}</span>
        </div>

        {/* Digital ID Badge */}
        <div className={styles.qrInfo}>
          <span className={styles.qrLabel}>ACCESS ID:</span>
          <span className={styles.qrId}>{id.substring(0, 8).toUpperCase()}...</span>
        </div>
      </div>
      
      {/* --- STATUS BADGE & ACTIONS --- */}
      <div className={styles.statusBadge}>
        
        {/* Status Indicator */}
        {attended_at ? (
          <>
            <div className={styles.statusText}>
              Verified <span className={styles.indicator}></span>
            </div>
            <span className={styles.statusTime}>
              Entered at {formatAttendedTime(attended_at)}
            </span>
          </>
        ) : (
          <div className={styles.statusText}>
            Pending <span className={styles.indicator}></span>
          </div>
        )}

        {/* --- THE NEW REVIEW BUTTON --- */}
        {can_review && (
          <button 
            className={styles.reviewBtn}
            onClick={(e) => {
              e.stopPropagation(); // Prevents card clicks if you ever make the card clickable
              onOpenReview();
            }}
          >
            ✨ Rate Experience
          </button>
        )}

      </div>
    </div>
  );
};

export default RegistrationCard;