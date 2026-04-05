/* src/components/RecommendationSection/RecommendationSection.jsx */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './RecommendationSection.module.css';

// --- SVG ICONS ---
const SparklesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

const RecommendationSection = () => {
  const [events, setEvents] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- DRAG SCROLL STATE ---
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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

  // --- DRAG EVENT HANDLERS ---
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>
            <div className={styles.spinner}></div>
            Analyzing Taste Profile...
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (events.length === 0 && facilities.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon}><SparklesIcon /></span>
        <h3 className={styles.title}>Curated For You</h3>
      </div>

      <div 
        className={styles.scrollContainer}
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        
        {/* Render Events */}
        {events.map((event) => (
          <Link 
            to="/events" 
            state={{ autoOpenEventId: event.id }} 
            key={`evt-${event.id}`} 
            className={styles.card}
          >
            <span className={styles.matchBadge}>Event Match</span>
            <h4 className={styles.cardTitle}>{event.title}</h4>
            <div className={styles.cardMeta}>
              <span className={styles.metaItem}><CalendarIcon /> {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}</span>
              <span className={styles.metaItem}><MapPinIcon /> {event.location ? event.location.split(',')[0] : 'Various'}</span>
            </div>
            <div className={styles.action}>View Details <ArrowRightIcon /></div>
          </Link>
        ))}

        {/* Render Facilities */}
        {facilities.map((fac) => (
          <Link to={`/facilities/${fac.id}/book`} key={`fac-${fac.id}`} className={styles.card}>
            <span className={styles.matchBadge}>Spot Match</span>
            <h4 className={styles.cardTitle}>{fac.name}</h4>
            <div className={styles.cardMeta}>
              <span className={styles.metaItem}><UsersIcon /> Cap: {fac.capacity}</span>
              <span className={styles.metaItem}><MapPinIcon /> {fac.location ? fac.location.split(',')[0] : 'Various'}</span>
            </div>
            <div className={styles.action}>Book Now <ArrowRightIcon /></div>
          </Link>
        ))}

        <div className={styles.spacer}></div>
      </div>
    </div>
  );
};

export default RecommendationSection;