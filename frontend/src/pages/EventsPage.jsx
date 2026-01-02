import React, { useState, useEffect } from 'react';
import api from '../services/api';
// Assuming we moved EventCard to common in the previous step
import EventCard from '../components/EventCard/EventCard'; 
import SkeletonCard from '../components/common/SkeletonCard';
import styles from './EventsPage.module.css';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Optional: Artificial delay to show off the skeleton loading state
        // await new Promise(r => setTimeout(r, 800)); 
        
        const response = await api.get('/events/');
        setEvents(response.data);
      } catch (err) {
        setError("Unable to retrieve event stream.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleDeleteEvent = (deletedId) => {
    setEvents((prev) => prev.filter(e => e.id !== deletedId));
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <h1 className={styles.title}>City Events</h1>
        <p className={styles.subtitle}>Discover and book upcoming activities in the metro area.</p>
      </div>
      
      {/* LOADING STATE */}
      {loading && (
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
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
      {!loading && !error && events.length === 0 && (
         <div className={styles.stateContainer}>
            <div className={styles.emptyIcon}>📅</div>
            <h3>No Events Scheduled</h3>
            <p>Check back later for updates.</p>
         </div>
      )}

      {/* DATA STATE */}
      {!loading && !error && events.length > 0 && (
        <div className={styles.grid}>
          {events.map((event) => (
            <EventCard key={event.id} event={event} onDelete={handleDeleteEvent} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;