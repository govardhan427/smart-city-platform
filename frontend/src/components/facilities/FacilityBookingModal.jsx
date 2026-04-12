/* src/components/facilities/FacilityBookingModal.jsx */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import FeedbackSection from '../FeedbackSection/FeedbackSection';
import useAuth from '../../hooks/useAuth'; // <-- 1. IMPORT AUTH HOOK
import styles from './FacilityBookingModal.module.css';

const FacilityBookingModal = ({ facility, onClose }) => {
  const { user } = useAuth(); // <-- 2. GET CURRENT USER
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [buying, setBuying] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const navigate = useNavigate();

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const mapsDeepLink = `https://www.google.com/maps/dir/?api=1&destination=${
    facility.latitude && facility.longitude 
      ? `${facility.latitude},${facility.longitude}` 
      : encodeURIComponent(facility.location)
  }`;

  const handleBook = async () => {
    // --- 3. LOGIN REDIRECT LOGIC ---
    if (!user) {
        toast.info("Please log in to book this facility.", { theme: "dark" });
        onClose(); // Close the modal
        navigate('/login'); // Send them to login
        return;
    }

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
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        <div className={styles.imageSection}>
          <img 
              src={facility.image_url || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80"} 
              alt={facility.name} 
              className={styles.modalImage}
          />
          <div className={styles.imageOverlay}></div>
        </div>

        {isBooked ? (
          <div className={styles.contentSection} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px', animation: 'bounce 1s ease infinite' }}>🎉</div>
            <h2 style={{ color: 'white', marginBottom: '8px', fontSize: '1.8rem' }}>Booking Confirmed!</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '30px', fontSize: '1rem' }}>
              Your slot for <strong>{facility.name}</strong> on {bookingDate} is secured.
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
                boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)',
                width: '100%'
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
                <h2 className={styles.modalTitle}>{facility.name}</h2>
                
                {facility.average_rating > 0 && (
                  <div className={styles.ratingPill}>
                    <span>⭐</span> {Number(facility.average_rating).toFixed(1)} / 5.0
                  </div>
                )}

                <div className={styles.metaRow}>
                  <span className={styles.metaItem} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    📍 {facility.location}
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
                  <span className={styles.metaItem}>👥 Capacity: {facility.capacity}</span>
                </div>
              </div>

              <p className={styles.description}>
                {facility.description || "State-of-the-art facility available for public booking."}
              </p>

              <div className={styles.divider}></div>
              
              <FeedbackSection reviews={facility.reviews} />
            </div>

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
        )}
      </div>
    </div>
  );
};

export default FacilityBookingModal;