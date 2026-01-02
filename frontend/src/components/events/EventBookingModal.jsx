import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- 1. Import useNavigate
import { toast } from 'react-toastify';
import api from '../../services/api';
import styles from './EventBookingModal.module.css';

const EventBookingModal = ({ event, onClose }) => {
  const [tickets, setTickets] = useState(1);
  const [buying, setBuying] = useState(false);
  
  const navigate = useNavigate(); // <--- 2. Initialize Hook

  // Helper to format Date
  const formatDate = (dateString, timeString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString).toLocaleDateString(undefined, options);
    const time = timeString ? timeString.slice(0, 5) : ''; 
    return `${date} • ${time}`;
  };

  // Calculate price upfront so we can use it in logic
  const totalPrice = event.price ? (event.price * tickets) : 0;

  const handleBuy = async () => {
    if (tickets < 1) return;

    // <--- 3. CHECK FOR PAYMENT --->
    if (totalPrice > 0) {
        onClose(); // Close modal
        navigate('/payment', { 
            state: { 
                amount: totalPrice,
                type: 'event', // Tell payment page this is an event
                details: { 
                    event_id: event.id,
                    tickets: tickets,
                    name: event.title 
                }
            }
        });
        return; // STOP here.
    }

    // <--- 4. IF FREE, BOOK IMMEDIATELY --->
    setBuying(true);
    
    try {
      await api.post(`/events/${event.id}/register/`, { tickets });
      
      toast.success(`Successfully booked ${tickets} ticket(s)!`);
      onClose(); 
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || "Booking failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setBuying(false);
    }
  };

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
          <div className={styles.imageOverlay}></div>
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
                   >-</button>
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
              {/* Dynamic Button Text */}
              {buying ? 'Processing...' : (totalPrice > 0 ? 'Proceed to Payment' : 'Confirm Booking')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventBookingModal;