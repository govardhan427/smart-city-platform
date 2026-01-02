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
  const [ticketCount, setTicketCount] = useState(1);

  // Format Date
  const formatDateTime = (dateStr, timeStr) => {
    try {
      const date = new Date(`${dateStr}T${timeStr}`);
      return date.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // --- DELETE (Admin) ---
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/events/${event.id}/`);
      if (onDelete) onDelete(event.id);
      toast.success("Event deleted.");
    } catch (err) {
      console.error("Failed to delete", err);
      toast.error("Failed to delete event.");
    }
  };

  // --- ACTION (Register/Buy) ---
  const handleAction = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const price = parseFloat(event.price || 0);
    const totalPrice = price * ticketCount;

    if (price > 0) {
      // Paid Flow
      navigate('/payment', {
        state: {
          type: 'event',
          id: event.id,
          title: event.title,
          price: totalPrice,
          extraData: { tickets: ticketCount }
        }
      });
    } else {
      // Free Flow
      setIsRegistering(true);
      try {
        await api.post(`/events/${event.id}/register/`, { tickets: ticketCount });
        toast.success("🎫 Registration Successful! Check your email.");
      } catch (err) {
        if (err.response && err.response.status === 400) {
          toast.error("You are already registered.");
        } else {
          toast.error("❌ Registration failed.");
        }
      } finally {
        setIsRegistering(false);
      }
    }
  };

  return (
    <div className={styles.card}>
      {/* 1. IMAGE COVER */}
      <img 
        src={event.image_url || 'https://placehold.co/600x400/101015/FFF?text=CityEvent'} 
        alt={event.title} 
        className={styles.image}
      />

      <div className={styles.cardBody}>
        
        {/* 2. HEADER */}
        <div className={styles.header}>
          <h3 className={styles.cardTitle}>{event.title}</h3>
          
          {parseFloat(event.price) > 0 ? (
            <span className={styles.badgePaid}>₹{event.price}</span>
          ) : (
             <span className={styles.badgeFree}>FREE</span>
          )}
        </div>

        {/* 3. DESCRIPTION */}
        <p className={styles.cardText}>
            {event.description?.length > 100 
                ? event.description.substring(0, 100) + '...' 
                : event.description}
        </p>
        
        {/* 4. METADATA BOX */}
        <div className={styles.cardInfo}>
          <span className={styles.infoItem}>
            <strong>📅</strong> {formatDateTime(event.date, event.time)}
          </span>
          
          <span className={styles.infoItem}>
            <strong>📍</strong> 
            {event.google_maps_url ? (
              <a href={event.google_maps_url} target="_blank" rel="noopener noreferrer" className={styles.mapLink}>
                  {event.location} (Map)
              </a>
            ) : (
              <span> {event.location}</span>
            )}
          </span>
        </div>

        {/* 5. TICKET SELECTOR */}
        <div className={styles.ticketControl}>
          <label>Tickets:</label>
          <select value={ticketCount} onChange={e => setTicketCount(parseInt(e.target.value))}>
            {[...Array(10).keys()].map(n => (
              <option key={n+1} value={n+1}>{n+1}</option>
            ))}
          </select>
        </div>

        {/* --- ADMIN CONTROLS --- */}
        {user && user.is_staff && (
          <div className={styles.adminControls}>
            <button 
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => navigate(`/admin/edit-event/${event.id}`)}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} 
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

        {/* 6. MAIN ACTION BUTTON */}
        <div style={{ marginTop: 'auto' }}>
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