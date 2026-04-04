/* src/pages/EventsPage.jsx */
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import EventBookingModal from '../components/events/EventBookingModal';
import styles from './EventsPage.module.css';
import SkeletonCard from '../components/common/SkeletonCard';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events/');
        // Safety: Ensure we always have an array
        setEvents(response.data || []);
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Helper to keep the grid looking neat
  const truncateText = (text, limit = 80) => {
    if (!text) return "Join us for this exciting city event!";
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  return (
    <div className={styles.container}>
      
      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.title}>City Events</h1>
        <p className={styles.subtitle}>Discover and book upcoming activities in the metro area.</p>
      </div>

      {/* GRID */}
      <div className={styles.grid}>
        
        {/* LOADING STATE */}
        {loading && (
            [...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
            ))
        )}

        {/* EMPTY STATE */}
        {!loading && events.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No upcoming events found.</h3>
            <p>Check back later for new city activities!</p>
          </div>
        )}

        {/* LOADED STATE */}
        {!loading && events.map((evt) => (
          <div 
            key={evt.id} 
            className={styles.card}
            onClick={() => setSelectedEvent(evt)}
          >
            <div className={styles.imageContainer}>
                <img 
                   src={evt.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80"} 
                   alt={evt.title} 
                   className={styles.cardImage}
                />
                <div className={`${styles.priceTag} ${Number(evt.price) === 0 ? styles.freeTag : ''}`}>
                   {Number(evt.price) > 0 ? `₹${evt.price}` : 'FREE'}
                </div>
            </div>

            <div className={styles.cardContent}>
               <h3 className={styles.cardTitle}>{evt.title}</h3>
               
               {/* RATING DISPLAY */}
               {evt.average_rating > 0 && (
                 <div className={styles.ratingRow}>
                    <span className={styles.star}>⭐</span>
                    <span className={styles.ratingValue}>{Number(evt.average_rating).toFixed(1)}</span>
                    <span className={styles.ratingMax}>/ 5.0</span>
                 </div>
               )}
               
               <div className={styles.cardDate}>
                  <span>📅</span> 
                  {evt.date ? new Date(evt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}
                  {evt.time && ` • ${evt.time.slice(0, 5)}`}
               </div>

               <p className={styles.cardDesc}>
                 {truncateText(evt.description)}
               </p>

               <div className={styles.viewBtn}>
                 View Details &rarr;
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedEvent && (
        <EventBookingModal 
           event={selectedEvent} 
           onClose={() => setSelectedEvent(null)} 
        />
      )}

    </div>
  );
};

export default EventsPage;