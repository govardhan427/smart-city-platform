import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import styles from './EventCard.module.css';
import { toast } from 'react-toastify';

const EventCard = ({ event, onDelete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [ticketCount, setTicketCount] = useState(1); // Ticket Counter State

  // Function to format date and time
  const formatDateTime = (dateStr, timeStr) => {
    try {
      const date = new Date(`${dateStr}T${timeStr}`);
      return date.toLocaleString('en-US', {
        dateStyle: 'long',
        timeStyle: 'short',
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // --- Handle Delete (Admin Only) ---
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await api.delete(`/events/${event.id}/`);
      if (onDelete) onDelete(event.id);
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Failed to delete event.");
    }
  };

  // --- Handle Register / Buy Logic ---
  const handleAction = async () => {
    // 1. Check Login
    if (!user) {
      navigate('/login');
      return;
    }

    const price = parseFloat(event.price || 0);
    const totalPrice = price * ticketCount;

    // 2. IF PAID: Go to Payment Page
    if (price > 0) {
      navigate('/payment', {
        state: {
          type: 'event',
          id: event.id,
          title: event.title,
          price: totalPrice,
          extraData: { tickets: ticketCount }
        }
      });
    } 
    // 3. IF FREE: Register Immediately
    else {
      setIsRegistering(true);
      try {
        await api.post(`/events/${event.id}/register/`, { tickets: ticketCount });
        toast.success("🎫 Registration Successful! Check your email.");
        // You might want to refresh the page or disable the button here
      } catch (err) {
        if (err.response && err.response.status === 400) {
          toast.error("You are already registered for this event.");
        } else {
          toast.error("❌ Registration failed. Please try again.");
        }
      } finally {
        setIsRegistering(false);
      }
    }
  };

  return (
    <div className={styles.card}>
      {/* 1. EVENT IMAGE */}
      <img 
        src={event.image_url || 'https://placehold.co/600x400?text=Event'} 
        alt={event.title} 
        className={styles.image}
      />

      <div className={styles.cardBody}>
        <div className={styles.header}>
          <h3 className={styles.cardTitle}>{event.title}</h3>
          
          {/* 2. PRICE BADGE */}
          {parseFloat(event.price) > 0 ? (
            <span className={styles.badgePaid}>₹{event.price}</span>
          ) : (
             <span className={styles.badgeFree}>FREE</span>
          )}
        </div>

        <p className={styles.cardText}>{event.description}</p>
        
        <div className={styles.cardInfo}>
          <span className={styles.infoItem}>
            <strong>Date:</strong> {formatDateTime(event.date, event.time)}
          </span>
          
          {/* 3. GOOGLE MAPS LINK */}
          <span className={styles.infoItem}>
            <strong>Location:</strong> 
            {event.google_maps_url ? (
              <a href={event.google_maps_url} target="_blank" rel="noopener noreferrer" className={styles.mapLink}>
                 📍 {event.location} (View Map)
              </a>
            ) : (
              <span> {event.location}</span>
            )}
          </span>
        </div>

        {/* 4. TICKET COUNTER */}
        <div className={styles.ticketControl}>
          <label>Tickets:</label>
          <select value={ticketCount} onChange={e => setTicketCount(parseInt(e.target.value))}>
            {[...Array(10).keys()].map(n => (
              <option key={n+1} value={n+1}>{n+1}</option>
            ))}
          </select>
        </div>

        {/* --- ADMIN CONTROLS (Only visible to Staff) --- */}
        {user && user.is_staff && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', borderTop: '1px solid #eee', paddingTop: '10px' }}>
            <button 
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => navigate(`/admin/edit-event/${event.id}`)}
              style={{ backgroundColor: '#6c757d' }} 
            >
              Edit
            </button>
            <button 
              className={`${styles.btn} ${styles.btnError}`}
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        )}

        {/* 5. ACTION BUTTON */}
        <div className={styles.cardFooter}>
          <button 
            className={`${styles.btn} ${styles.btnPrimary}`} 
            onClick={handleAction} 
            disabled={isRegistering}
          >
            {isRegistering ? 'Processing...' : parseFloat(event.price) > 0 ? `Buy Tickets (₹${event.price * ticketCount})` : 'Register Free'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;