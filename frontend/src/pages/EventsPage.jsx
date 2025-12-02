import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EventCard from '../components/EventCard/EventCard';
import SkeletonCard from '../components/common/SkeletonCard'; // Import Skeleton
import styles from './EventsPage.module.css'; // Reusing grid styles

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Add a fake delay so you can actually admire the skeleton animation
        // await new Promise(r => setTimeout(r, 1500)); 
        
        const response = await api.get('/events/');
        setEvents(response.data);
      } catch (err) {
        setError("Failed to load events.");
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
    <div className={styles.homeContainer}>
      <h1 className={styles.title}>UPCOMING EVENTS</h1>
      
      {/* SKELETON LOADING STATE */}
      {loading && (
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && <div className={styles.error}>{error}</div>}

      {/* DATA STATE */}
      {!loading && !error && (
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