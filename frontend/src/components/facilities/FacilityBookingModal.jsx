import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- 1. Import useNavigate
import { toast } from 'react-toastify';
import api from '../../services/api';
import styles from '../events/EventBookingModal.module.css'; 

const FacilityBookingModal = ({ facility, onClose }) => {
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [buying, setBuying] = useState(false);
  
  const navigate = useNavigate(); // <--- 2. Initialize Hook

  const handleBook = async () => {
    if (!bookingDate || !timeSlot) {
        toast.warning("Please select a date and time slot.");
        return;
    }

    // <--- 3. CHECK FOR PAYMENT --->
    // If the facility has a price > 0, redirect to Payment Page
    const price = Number(facility.price);
    
    if (price > 0) {
        onClose(); // Close the modal
        navigate('/payment', { 
            state: { 
                amount: price,
                type: 'facility', // Tell payment page this is a facility
                details: { 
                    facility_id: facility.id,
                    booking_date: bookingDate,
                    time_slot: timeSlot,
                    name: facility.name // Optional: for display on payment page
                }
            }
        });
        return; // STOP here. Do not create booking yet.
    }

    // <--- 4. IF FREE, BOOK IMMEDIATELY (Existing Logic) --->
    setBuying(true);
    try {
      await api.post(`/facilities/${facility.id}/book/`, { 
          booking_date: bookingDate,
          time_slot: timeSlot
      });
      
      toast.success(`Successfully booked ${facility.name}!`);
      onClose();

    } catch (err) {
      console.error(err);
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
                        {/* MATCHING DJANGO BACKEND SLOTS */}
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
              {/* Change button text dynamically */}
              {buying ? 'Processing...' : (facility.price > 0 ? 'Proceed to Payment' : 'Book Now')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FacilityBookingModal;