/* src/components/common/RegistrationCard.jsx */
import React from 'react';
import styles from './RegistrationCard.module.css';

const RegistrationCard = ({ registration, onOpenReview }) => {
  // 1. SAFE DESTRUCTURING
  // We check for event_details (from your page) OR event (just in case)
  const eventData = registration.event_details || registration.event || {};
  const { attended_at, id, can_review } = registration;

  // 2. HELPER FUNCTIONS (Keep these as they are, they look good)
  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return "TBD"; 
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

  // 3. RENDER (Use eventData instead of event)
  return (
    <div className={`${styles.card} ${attended_at ? styles.checkedIn : styles.pending}`}>
      
      <div className={styles.cardBody}>
        {/* Use eventData here */}
        <h3 className={styles.cardTitle}>{eventData.title || "Untitled Event"}</h3>
        
        <div className={styles.cardMeta}>
          <span className={styles.metaItem}>📅 {formatDateTime(eventData.date, eventData.time)}</span>
          <span className={styles.metaItem}>📍 {eventData.location || "Online"}</span>
        </div>

        <div className={styles.qrInfo}>
          <span className={styles.qrLabel}>ACCESS ID:</span>
          <span className={styles.qrId}>{id ? id.substring(0, 8).toUpperCase() : 'N/A'}...</span>
        </div>
      </div>
      
      <div className={styles.statusBadge}>
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

        {/* --- THE NEW REVIEW BUTTON (Perfectly implemented!) --- */}
        {can_review && (
          <button 
            className={styles.reviewBtn}
            onClick={(e) => {
              e.stopPropagation(); 
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