import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import styles from './EventBookingModal.module.css';

const EventBookingModal = ({ event, onClose }) => {
  const [tickets, setTickets] = useState(1);
  const [buying, setBuying] = useState(false);

  // Helper to format Date
  const formatDate = (dateString, timeString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString).toLocaleDateString(undefined, options);
    
    // Format time if needed (simple slice or regex)
    const time = timeString ? timeString.slice(0, 5) : ''; 
    return `${date} • ${time}`;
  };

  const handleBuy = async () => {
    if (tickets < 1) return;
    setBuying(true);
    
    try {
      // POST to booking endpoint
      await api.post(`/events/${event.id}/register/`, { tickets });
      toast.success(`Successfully booked ${tickets} ticket(s)!`);
      onClose(); // Close modal on success
    } catch (err) {
      console.error(err);
      toast.error("Booking failed. Please try again.");
    } finally {
      setBuying(false);
    }
  };

  const totalPrice = event.price ? (event.price * tickets) : 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        {/* LEFT: VISUALS */}
        <div className={styles.imageSection}>
          <img 
             src={event.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80"} 
             alt={event.title} 
             className={styles.modalImage}
          />
          <div className={styles.imageOverlay}>
             {/* Optional: Add icons or badges here */}
          </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div className={styles.contentSection}>
          <div className={styles.header}>
            <h2 className={styles.modalTitle}>{event.title}</h2>
            <div className={styles.metaRow}>
              <span className={styles.metaItem}>📅 {formatDate(event.date, event.time)}</span>
              <span className={styles.metaItem}>📍 {event.location}</span>
            </div>
          </div>

          <p className={styles.description}>
            {event.description || "No description available for this event."}
          </p>
          
          {/* External Map Link if available */}
          {event.google_maps_url && (
             <a 
               href={event.google_maps_url} 
               target="_blank" 
               rel="noreferrer" 
               style={{color: '#3b82f6', marginBottom: '20px', display: 'inline-block', fontSize: '0.9rem'}}
             >
               View on Google Maps ↗
             </a>
          )}

          {/* BOOKING CONTROLS */}
          <div className={styles.bookingControls}>
            <div className={styles.controlRow}>
              <div>
                <div className={styles.label}>Select Tickets</div>
                <div className={styles.counter}>
                   <button 
                     className={styles.counterBtn} 
                     onClick={() => setTickets(Math.max(1, tickets - 1))}
                   >−</button>
                   <span className={styles.ticketCount}>{tickets}</span>
                   <button 
                     className={styles.counterBtn} 
                     onClick={() => setTickets(tickets + 1)}
                   >+</button>
                </div>
              </div>

              <div style={{textAlign: 'right'}}>
                 <div className={styles.label}>Total Price</div>
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
              {buying ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventBookingModal;