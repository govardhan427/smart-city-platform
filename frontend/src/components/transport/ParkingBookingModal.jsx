import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- 1. Import useNavigate
import { toast } from 'react-toastify';
import api from '../../services/api';
import styles from '../events/EventBookingModal.module.css'; // Reusing the consistent modal theme

const ParkingBookingModal = ({ lot, onClose }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [hours, setHours] = useState(2);
  const [booking, setBooking] = useState(false);

  const navigate = useNavigate(); // <--- 2. Initialize Hook

  // Calculate price upfront
  const totalPrice = lot.rate_per_hour * hours;

  const handleBook = async () => {
    if (!vehicleNumber.trim()) {
        toast.warning("Please enter your vehicle number.");
        return;
    }

    // <--- 3. CHECK FOR PAYMENT --->
    if (totalPrice > 0) {
        onClose(); // Close modal
        navigate('/payment', { 
            state: { 
                amount: totalPrice,
                type: 'parking', // Tell payment page this is for parking
                details: { 
                    parking_lot_id: lot.id,
                    vehicle_number: vehicleNumber,
                    duration_hours: hours,
                    name: lot.name
                }
            }
        });
        return; // STOP here.
    }

    // <--- 4. IF FREE, BOOK IMMEDIATELY --->
    setBooking(true);
    
    try {
      await api.post(`/transport/parking/${lot.id}/book/`, { 
          vehicle_number: vehicleNumber,
          duration_hours: hours
      });
      
      toast.success(`Spot reserved at ${lot.name}!`);
      onClose();

    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || "Booking failed. Lot might be full.";
      toast.error(errorMessage);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        {/* LEFT: VISUALS */}
        <div className={styles.imageSection}>
          <img 
             src={lot.image_url || "https://images.unsplash.com/photo-1470224114660-3f6686c562eb?auto=format&fit=crop&q=80"} 
             alt={lot.name} 
             className={styles.modalImage}
          />
          <div className={styles.imageOverlay}></div>
        </div>

        {/* RIGHT: DETAILS */}
        <div className={styles.contentSection}>
          <div className={styles.header}>
            <h2 className={styles.modalTitle}>{lot.name}</h2>
            <div className={styles.metaRow}>
              <span className={styles.metaItem}>📍 {lot.location}</span>
              <span className={styles.metaItem}>🚗 {lot.capacity} Total Spots</span>
            </div>
          </div>

          <p className={styles.description}>
            Secure a guaranteed spot in this high-demand zone. Smart sensors will guide you to your allocated bay upon arrival.
          </p>
          
          {lot.google_maps_url && (
             <a href={lot.google_maps_url} target="_blank" rel="noreferrer" style={{color: '#3b82f6', marginBottom: '20px', display: 'inline-block', fontSize: '0.9rem'}}>
               Navigate to Entry Gate ↗
             </a>
          )}

          {/* BOOKING CONTROLS */}
          <div className={styles.bookingControls}>
            
            {/* Input Fields */}
            <div style={{marginBottom: '20px'}}>
                <div className={styles.label} style={{marginBottom:'8px'}}>Vehicle Plate Number</div>
                <input 
                    type="text" 
                    placeholder="e.g. TN-07-AB-1234"
                    className={styles.counter} 
                    style={{width: '100%', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '12px', background: 'rgba(0,0,0,0.3)', textTransform: 'uppercase'}}
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                />
            </div>

            <div className={styles.controlRow}>
              <div>
                <div className={styles.label}>Duration (Hours)</div>
                <div className={styles.counter}>
                   <button 
                     className={styles.counterBtn} 
                     onClick={() => setHours(Math.max(1, hours - 1))}
                   >-</button>
                   <span className={styles.ticketCount}>{hours}h</span>
                   <button 
                     className={styles.counterBtn} 
                     onClick={() => setHours(Math.min(24, hours + 1))}
                   >+</button>
                </div>
              </div>

              <div style={{textAlign: 'right'}}>
                 <div className={styles.label}>Total Fee</div>
                 <div className={styles.totalPrice}>
                    {totalPrice === 0 ? "FREE" : `₹${totalPrice}`}
                 </div>
              </div>
            </div>

            <button 
                className={styles.buyBtn} 
                onClick={handleBook} 
                disabled={booking}
            >
              {/* Dynamic Button Text */}
              {booking ? 'Reserving Spot...' : (totalPrice > 0 ? 'Proceed to Payment' : 'Confirm Reservation')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ParkingBookingModal;