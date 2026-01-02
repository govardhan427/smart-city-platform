import React, { useState, useEffect } from 'react';
import api from '../services/api';
// Using the new common component
import RegistrationCard from '../components/common/RegistrationCard'; 
import styles from './MyRegistrationsPage.module.css';

const MyRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const response = await api.get('/events/my-registrations/');
        setRegistrations(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching registrations:", err);
        setError("Unable to retrieve your digital passes.");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Events</h1>
      <p className={styles.subtitle}>Your active tickets and check-in history.</p>

      {/* LOADING STATE */}
      {loading && (
        <div className={styles.loading}>
           Syncing wallet...
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div className={styles.stateContainer}>
           <div className={styles.errorIcon}>⚠️</div>
           <div className={styles.errorText}>{error}</div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && registrations.length === 0 && (
        <div className={styles.stateContainer}>
           <div className={styles.emptyIcon}>🎟️</div>
           <h3>No Active Tickets</h3>
           <p>You haven't registered for any events yet.</p>
        </div>
      )}

      {/* DATA LIST */}
      {!loading && !error && registrations.length > 0 && (
        <div className={styles.registrationList}>
          {registrations.map((reg) => (
            <RegistrationCard key={reg.id} registration={reg} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRegistrationsPage;