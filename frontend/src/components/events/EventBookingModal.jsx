/* src/components/events/EventBookingModal.jsx */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import FeedbackSection from '../FeedbackSection/FeedbackSection';
import useAuth from '../../hooks/useAuth'; // <-- 1. IMPORT AUTH HOOK
import styles from './EventBookingModal.module.css';

const formatDate = (dateString, timeString) => {
  if (!dateString) return "TBD";
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString).toLocaleDateString(undefined, options);
  const time = timeString ? timeString.slice(0, 5) : ''; 
  return `${date} • ${time}`;
};

const EventBookingModal = ({ event, onClose }) => {
  const { user } = useAuth(); // <-- 2. GET CURRENT USER
  const [tickets, setTickets] = useState(1);
  const [buying, setBuying] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const navigate = useNavigate();

  const mapsDeepLink = `https://www.google.com/maps/dir/?api=1&destination=${
    event.latitude && event.longitude 
      ? `${event.latitude},${event.longitude}` 
      : encodeURIComponent(event.location)
  }`;

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const totalPrice = event.price ? (event.price * tickets) : 0;

  const handleBuy = async () => {
    // --- 3. LOGIN REDIRECT LOGIC ---
    if (!user) {
        toast.info("Please log in to secure your tickets.", { theme: "dark" });
        onClose(); // Close the modal
        navigate('/login'); // Send them to login
        return;
    }

    if (tickets < 1) return;

    if (totalPrice > 0) {
        onClose(); 
        navigate('/payment', { 
            state: { 
                type: 'event', 
                id: event.id,          
                title: event.title,    
                price: totalPrice,     
                extraData: { tickets }
            }
        });
        return; 
    }

    setBuying(true);
    try {
      await api.post(`/events/${event.id}/register/`, { tickets });
      toast.success(`Successfully booked ${tickets} ticket(s)!`);
      setIsBooked(true); 
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Booking failed.";
      toast.error(errorMessage);
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>

        <div className={styles.imageSection}>
          <img 
             src={event.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80"} 
             alt={event.title} 
             className={styles.modalImage}
          />
          <div className={styles.imageOverlay}></div>
        </div>

        {isBooked ? (
          <div className={styles.contentSection} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px', animation: 'bounce 1s ease infinite' }}>🎉</div>
            <h2 style={{ color: 'white', marginBottom: '8px', fontSize: '1.8rem' }}>Booking Confirmed!</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '30px', fontSize: '1rem' }}>
              Your {tickets} ticket(s) for <strong>{event.title}</strong> are secured.
            </p>
            
            <a 
              href={mapsDeepLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.buyBtn}
              style={{ 
                textDecoration: 'none', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '10px', 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                fontSize: '1.1rem', 
                padding: '16px',
                boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)'
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" style={{ width: '24px', height: '24px' }}>
                 <path d="M9 6a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3h0a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3zm3 3v12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                 <path d="M15 14l-3 3-3-3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
              </svg>
              Start Navigation
            </a>
            
            <button 
              onClick={onClose}
              style={{ marginTop: '20px', background: 'transparent', border: 'none', color: '#60a5fa', fontWeight: 'bold', cursor: 'pointer', padding: '10px' }}
            >
              Close & Return to Hub
            </button>
          </div>
        ) : (
          <div className={styles.contentSection}>
            <div className={styles.scrollableArea}>
              <div className={styles.header}>
                <h2 className={styles.modalTitle}>{event.title}</h2>
                
                {event.average_rating > 0 && (
                  <div className={styles.ratingPill}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {Number(event.average_rating).toFixed(1)} / 5.0
                  </div>
                )}

                <div className={styles.metaRow}>
                  <span className={styles.metaItem}>📅 {formatDate(event.date, event.time)}</span>
                  
                  <span className={styles.metaItem} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    📍 {event.location}
                    <a 
                      href={mapsDeepLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        fontSize: '0.75rem', 
                        color: '#60a5fa', 
                        textDecoration: 'none', 
                        fontWeight: 'bold', 
                        background: 'rgba(59, 130, 246, 0.15)', 
                        padding: '4px 8px', 
                        borderRadius: '8px',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Directions ↗
                    </a>
                  </span>
                </div>
              </div>

              <p className={styles.description}>
                {event.description || "No description available."}
              </p>

              <div className={styles.feedbackDivider}></div>
              <FeedbackSection reviews={event.reviews} />
            </div>

            <div className={styles.bookingControls}>
              <div className={styles.controlRow}>
                <div>
                  <div className={styles.label}>Tickets</div>
                  <div className={styles.counter}>
                     <button 
                       className={styles.counterBtn} 
                       onClick={() => setTickets(Math.max(1, tickets - 1))}
                     >-</button>
                     <span className={styles.ticketCount}>{tickets}</span>
                     <button 
                       className={styles.counterBtn} 
                       onClick={() => setTickets(Math.min(10, tickets + 1))}
                     >+</button>
                  </div>
                </div>

                <div style={{textAlign: 'right'}}>
                   <div className={styles.label}>Total</div>
                   <div className={styles.totalPrice}>
                      {totalPrice === 0 ? "FREE" : `₹${totalPrice}`}
                   </div>
                </div>
              </div>

              <button 
                  className={styles.buyBtn} 
                  onClick={handleBuy} 
                  disabled={buying}
              >
                {buying ? 'Processing...' : (totalPrice > 0 ? 'Proceed to Payment' : 'Confirm Booking')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventBookingModal;