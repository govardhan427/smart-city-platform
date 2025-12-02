import React from 'react';
import styles from './RegistrationCard.module.css'; // We'll create this next

const RegistrationCard = ({ registration }) => {
  // The 'registration' prop contains the nested 'event' object
  const { event, attended_at, id } = registration;

  // Function to format date and time
  const formatDateTime = (dateStr, timeStr) => {
    try {
      const date = new Date(`${dateStr}T${timeStr}`);
      return date.toLocaleString('en-US', {
        dateStyle: 'long', // "October 30, 2025"
        timeStyle: 'short', // "2:00 PM"
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Function to format just the check-in time
  const formatAttendedTime = (dateTimeStr) => {
     try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (e) {
      return "Invalid time";
    }
  }

  // This is our unique UUID for the QR code
  const registrationId = id;

  return (
    <div className={styles.card}>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{event.title}</h3>
        <p className={styles.cardLocation}>{event.location}</p>
        <p className={styles.cardDateTime}>
          {formatDateTime(event.date, event.time)}
        </p>

        {/* Show the QR code ID, so the user has it for reference */}
        <div className={styles.qrInfo}>
          <span className={styles.qrLabel}>Registration ID:</span>
          <span className={styles.qrId}>{registrationId}</span>
        </div>
      </div>
      
      {/* This is the status badge on the side */}
      <div 
        className={`${styles.statusBadge} ${
          attended_at ? styles.statusCheckedIn : styles.statusPending
        }`}
      >
        {attended_at ? (
          <>
            Checked In
            <span className={styles.statusTime}>
              ({formatAttendedTime(attended_at)})
            </span>
          </>
        ) : (
          'Pending Check-In'
        )}
      </div>
    </div>
  );
};

export default RegistrationCard;