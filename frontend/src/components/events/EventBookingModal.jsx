/* src/components/events/EventBookingModal.jsx */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import FeedbackSection from '../FeedbackSection/FeedbackSection';
import styles from './EventBookingModal.module.css';

// Move helper outside to avoid re-creation on render
const formatDate = (dateString, timeString) => {
  if (!dateString) return "TBD";
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString).toLocaleDateString(undefined, options);
  const time = timeString ? timeString.slice(0, 5) : ''; 
  return `${date} • ${time}`;
};

const EventBookingModal = ({ event, onClose }) => {
  const [tickets, setTickets] = useState(1);
  const [buying, setBuying] = useState(false);
  const navigate = useNavigate();

  // Close modal on Escape key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const totalPrice = event.price ? (event.price * tickets) : 0;

  const handleBuy = async () => {
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
      onClose(); 
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

        {/* Scrollable Content wrapper starts here */}
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
                <span className={styles.metaItem}>📍 {event.location}</span>
              </div>
            </div>

            <p className={styles.description}>
              {event.description || "No description available."}
            </p>
            
            {event.google_maps_url && (
               <a 
                 href={event.google_maps_url} 
                 target="_blank" 
                 rel="noreferrer" 
                 className={styles.mapLink}
               >
                 View on Google Maps ↗
               </a>
            )}

            <div className={styles.feedbackDivider}></div>
            <FeedbackSection reviews={event.reviews} />
          </div>

          {/* Fixed Booking Controls at the bottom */}
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
                     // Limit tickets to 10 per person if no backend limit exists
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
      </div>
    </div>
  );
};

export default EventBookingModal;