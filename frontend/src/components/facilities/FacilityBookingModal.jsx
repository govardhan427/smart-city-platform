import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import styles from '../events/EventBookingModal.module.css'; // Reuse Event Modal Styles for consistency

const FacilityBookingModal = ({ facility, onClose }) => {
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [buying, setBuying] = useState(false);

  const handleBook = async () => {
    if (!bookingDate || !timeSlot) {
        toast.warning("Please select a date and time slot.");
        return;
    }
    setBuying(true);
    
    try {
      // FIX 1: Send request to the specific URL with ID
      await api.post(`/facilities/${facility.id}/book/`, { 
          booking_date: bookingDate,
          time_slot: timeSlot
      });
      
      toast.success(`Successfully booked ${facility.name}!`);
      onClose();

    } catch (err) {
      console.error(err);
      
      // FIX 2: Read the actual error message from backend
      const errorMessage = err.response?.data?.error || "Booking failed due to server error.";
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
             src={facility.image_url || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80"} 
             alt={facility.name} 
             className={styles.modalImage}
          />
          <div className={styles.imageOverlay}></div>
        </div>

        {/* RIGHT: DETAILS */}
        <div className={styles.contentSection}>
          <div className={styles.header}>
            <h2 className={styles.modalTitle}>{facility.name}</h2>
            <div className={styles.metaRow}>
              <span className={styles.metaItem}>📍 {facility.location}</span>
              <span className={styles.metaItem}>👥 Capacity: {facility.capacity}</span>
            </div>
          </div>

          <p className={styles.description}>
            {facility.description || "State-of-the-art facility available for public booking."}
          </p>
          
          {facility.google_maps_url && (
             <a href={facility.google_maps_url} target="_blank" rel="noreferrer" style={{color: '#3b82f6', marginBottom: '20px', display: 'inline-block', fontSize: '0.9rem'}}>
               View Location on Maps ↗
             </a>
          )}

          {/* BOOKING CONTROLS */}
          <div className={styles.bookingControls}>
            
            {/* Date & Time Inputs */}
            <div style={{display: 'flex', gap: '15px', marginBottom: '20px'}}>
                <div style={{flex: 1}}>
                    <div className={styles.label} style={{marginBottom:'8px'}}>Date</div>
                    <input 
                        type="date" 
                        className={styles.counter} 
                        style={{width: '100%', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', background: 'rgba(0,0,0,0.3)'}}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                    />
                </div>
                <div style={{flex: 1}}>
                    <div className={styles.label} style={{marginBottom:'8px'}}>Time Slot</div>
                    <select 
                        className={styles.counter}
                        style={{width: '100%', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', background: 'rgba(0,0,0,0.3)'}}
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                    >
                        <option value="" style={{color: 'black'}}>Select Slot</option>
                        {/* UPDATED SLOTS TO MATCH BACKEND MODELS.PY */}
                        <option value="09:00-11:00" style={{color: 'black'}}>Morning (9 AM - 11 AM)</option>
                        <option value="12:00-14:00" style={{color: 'black'}}>Afternoon (12 PM - 2 PM)</option>
                        <option value="15:00-17:00" style={{color: 'black'}}>Evening (3 PM - 5 PM)</option>
                        <option value="18:00-20:00" style={{color: 'black'}}>Night (6 PM - 8 PM)</option>
                    </select>
                </div>
            </div>

            <div className={styles.controlRow}>
              <div style={{textAlign: 'right', width: '100%'}}>
                 <div className={styles.label}>Price per Slot</div>
                 <div className={styles.totalPrice}>
                    {facility.price > 0 ? `₹${facility.price}` : "FREE"}
                 </div>
              </div>
            </div>

            <button 
                className={styles.buyBtn} 
                onClick={handleBook} 
                disabled={buying}
            >
              {buying ? 'Confirming...' : 'Book Facility'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FacilityBookingModal;