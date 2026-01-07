import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './RecommendationSection.module.css';

const RecommendationSection = () => {
  const [events, setEvents] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Run both requests in parallel for speed
        const [eventsRes, facilitiesRes] = await Promise.all([
          api.get('/recommendations/events/'),
          api.get('/recommendations/facilities/')
        ]);
        
        setEvents(eventsRes.data);
        setFacilities(facilitiesRes.data);
      } catch (err) {
        console.error("AI Service Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          Generating personalized suggestions...
        </div>
      </div>
    );
  }

  // If no data, don't render anything (keep UI clean)
  if (events.length === 0 && facilities.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon}>✨</span>
        <h3 className={styles.title}>Curated For You</h3>
      </div>

      <div className={styles.grid}>
        
        {/* Render Events */}
        {events.map((event) => (
          <Link to={`/events`} key={`evt-${event.id}`} className={styles.card}>
            <span className={styles.matchBadge}>Event Match</span>
            <h4 className={styles.cardTitle}>{event.title}</h4>
            <div className={styles.cardMeta}>
              <span>📅 {event.date}</span>
              <span>📍 {event.location}</span>
            </div>
            <p className={styles.cardDesc}>{event.description}</p>
            <div className={styles.action}>View Details →</div>
          </Link>
        ))}

        {/* Render Facilities */}
        {facilities.map((fac) => (
          <Link to={`/facilities`} key={`fac-${fac.id}`} className={styles.card}>
            <span className={styles.matchBadge}>Spot Match</span>
            <h4 className={styles.cardTitle}>{fac.name}</h4>
            <div className={styles.cardMeta}>
              <span>👥 Cap: {fac.capacity}</span>
              <span>📍 {fac.location}</span>
            </div>
            <p className={styles.cardDesc}>{fac.description}</p>
            <div className={styles.action}>Book Now →</div>
          </Link>
        ))}

      </div>
    </div>
  );
};

export default RecommendationSection;