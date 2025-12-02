import React, { useState, useEffect } from 'react';
import api from '../services/api';
// We'll create this component next
import RegistrationCard from '../components/RegistrationCard/RegistrationCard'; 
import styles from './MyRegistrationsPage.module.css'; // We'll create this next

const MyRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        // This is a protected endpoint. 'api.js' will automatically
        // send our auth token.
        const response = await api.get('/events/my-registrations/');
        setRegistrations(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching registrations:", err);
        setError("Failed to load your registrations.");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []); // Runs once on component mount

  const renderContent = () => {
    if (loading) {
      return <div className={styles.loading}>Loading your registrations...</div>;
    }

    if (error) {
      return <div className={styles.error}>{error}</div>;
    }

    if (registrations.length === 0) {
      return (
        <div className={styles.empty}>
          You haven't registered for any events yet.
        </div>
      );
    }

    return (
      <div className={styles.registrationList}>
        {registrations.map((reg) => (
          // The key is the unique registration ID (the UUID)
          <RegistrationCard key={reg.id} registration={reg} />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Registrations</h1>
      {renderContent()}
    </div>
  );
};

export default MyRegistrationsPage;