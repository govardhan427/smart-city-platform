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
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

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

        {/* LOADED STATE */}
        {!loading && events.map((evt) => (
          <div 
            key={evt.id} 
            className={styles.card}
            onClick={() => setSelectedEvent(evt)}
          >
            <img 
               src={evt.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80"} 
               alt={evt.title} 
               className={styles.cardImage}
            />

            <div className={`${styles.priceTag} ${evt.price == 0 ? styles.freeTag : ''}`}>
               {evt.price > 0 ? `₹${evt.price}` : 'FREE'}
            </div>

            <div className={styles.cardContent}>
               <h3 className={styles.cardTitle}>{evt.title}</h3>
               
               {/* --- NEW: TINY RATING UNDER TITLE --- */}
               {evt.average_rating && (
                 <div style={{ color: '#fbbf24', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 'bold' }}>
                   ⭐ {evt.average_rating} / 5.0
                 </div>
               )}
               
               <div className={styles.cardDate}>
                  <span>📅</span> 
                  {new Date(evt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  {evt.time && ` • ${evt.time.slice(0, 5)}`}
               </div>

               <p className={styles.cardDesc}>
                 {evt.description || "Click to see more details about this event."}
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