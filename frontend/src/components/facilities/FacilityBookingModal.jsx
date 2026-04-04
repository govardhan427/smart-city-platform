/* src/components/facilities/FacilityBookingModal.jsx */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import FeedbackSection from '../FeedbackSection/FeedbackSection';
import styles from './FacilityBookingModal.module.css'; // Using a dedicated CSS now

const FacilityBookingModal = ({ facility, onClose }) => {
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [buying, setBuying] = useState(false);
  const navigate = useNavigate();

  // Prevent past dates in the input
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleBook = async () => {
    if (!bookingDate || !timeSlot) {
      toast.warning("Please select a date and time slot.");
      return;
    }

    const price = Number(facility.price);
    
    if (price > 0) {
      onClose(); 
      navigate('/payment', { 
        state: { 
          type: 'facility',
          id: facility.id,
          title: facility.name,
          price: price,
          extraData: { 
            booking_date: bookingDate,
            time_slot: timeSlot
          }
        }
      });
      return;
    }

    setBuying(true);
    try {
      await api.post(`/facilities/${facility.id}/book/`, { 
          booking_date: bookingDate,
          time_slot: timeSlot
      });
      
      toast.success(`Successfully booked ${facility.name}!`);
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
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        {/* LEFT: IMAGE */}
        <div className={styles.imageSection}>
          <img 
              src={facility.image_url || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80"} 
              alt={facility.name} 
              className={styles.modalImage}
          />
          <div className={styles.imageOverlay}></div>
        </div>

        {/* RIGHT: DETAILS & FORM */}
        <div className={styles.contentSection}>
          <div className={styles.scrollableArea}>
            <div className={styles.header}>
              <h2 className={styles.modalTitle}>{facility.name}</h2>
              
              {/* Rating Pill */}
              {facility.average_rating > 0 && (
                <div className={styles.ratingPill}>
                  <span>⭐</span> {Number(facility.average_rating).toFixed(1)} / 5.0
                </div>
              )}

              <div className={styles.metaRow}>
                <span className={styles.metaItem}>📍 {facility.location}</span>
                <span className={styles.metaItem}>👥 Capacity: {facility.capacity}</span>
              </div>
            </div>

            <p className={styles.description}>
              {facility.description || "State-of-the-art facility available for public booking."}
            </p>
            
            {facility.google_maps_url && (
               <a href={facility.google_maps_url} target="_blank" rel="noreferrer" className={styles.mapLink}>
                 View Location on Maps ↗
               </a>
            )}

            <div className={styles.divider}></div>
            
            {/* Citizen Reviews */}
            <FeedbackSection reviews={facility.reviews} />
          </div>

          {/* FIXED BOOKING CONTROLS */}
          <div className={styles.bookingControls}>
            <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Select Date</label>
                    <input 
                        type="date" 
                        className={styles.glassInput} 
                        min={today}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Time Slot</label>
                    <select 
                        className={styles.glassSelect}
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                    >
                        <option value="">Select Slot</option>
                        <option value="09:00-11:00">Morning (9 AM - 11 AM)</option>
                        <option value="12:00-14:00">Afternoon (12 PM - 2 PM)</option>
                        <option value="15:00-17:00">Evening (3 PM - 5 PM)</option>
                        <option value="18:00-20:00">Night (6 PM - 8 PM)</option>
                    </select>
                </div>
            </div>

            <div className={styles.priceRow}>
                 <span className={styles.label}>Price per Slot</span>
                 <span className={styles.totalPrice}>
                    {facility.price > 0 ? `₹${facility.price}` : "FREE"}
                 </span>
            </div>

            <button 
                className={styles.buyBtn} 
                onClick={handleBook} 
                disabled={buying}
            >
              {buying ? 'Processing...' : (facility.price > 0 ? 'Proceed to Payment' : 'Book Now')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityBookingModal;