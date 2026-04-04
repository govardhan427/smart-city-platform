/* src/components/transport/ParkingBookingModal.jsx */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import styles from './ParkingBookingModal.module.css'; // Using a dedicated Red theme

const ParkingBookingModal = ({ lot, onClose }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [hours, setHours] = useState(2);
  const [booking, setBooking] = useState(false);

  const navigate = useNavigate(); 
  const totalPrice = lot.rate_per_hour * hours;

  const handleBook = async () => {
    if (!vehicleNumber.trim()) {
        toast.warning("Please enter your vehicle number.");
        return;
    }

    if (totalPrice > 0) {
        onClose(); 
        navigate('/payment', { 
            state: { 
                type: 'parking',
                id: lot.id,
                title: lot.name,
                price: totalPrice,
                extraData: { 
                    vehicle_number: vehicleNumber.toUpperCase(),
                    duration_hours: hours
                }
            }
        });
        return;
    }

    setBooking(true);
    try {
      await api.post(`/transport/parking/${lot.id}/book/`, { 
          vehicle_number: vehicleNumber.toUpperCase(),
          duration_hours: hours
      });
      toast.success(`Spot reserved at ${lot.name}!`);
      onClose();
    } catch (err) {
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

        {/* LEFT: IMAGE SECTION */}
        <div className={styles.imageSection}>
          <img 
              src={lot.image_url || "https://images.unsplash.com/photo-1470224114660-3f6686c562eb?auto=format&fit=crop&q=80"} 
              alt={lot.name} 
              className={styles.modalImage}
          />
          <div className={styles.imageOverlay}></div>
        </div>

        {/* RIGHT: CONTENT SECTION */}
        <div className={styles.contentSection}>
          <div className={styles.scrollableArea}>
            <div className={styles.header}>
              <h2 className={styles.modalTitle}>{lot.name}</h2>
              <div className={styles.metaRow}>
                <span className={styles.metaItem}>📍 {lot.location}</span>
                <span className={styles.metaItem}>🚗 {lot.capacity} Total Spots</span>
              </div>
            </div>

            <p className={styles.description}>
              Secure a guaranteed spot in this high-demand zone. Smart sensors will guide you to your allocated bay upon arrival. 24/7 CCTV surveillance active.
            </p>

            {lot.google_maps_url && (
               <a href={lot.google_maps_url} target="_blank" rel="noreferrer" className={styles.mapLink}>
                 Navigate to Entry Gate ↗
               </a>
            )}

            <div className={styles.divider}></div>

            {/* VEHICLE INPUT */}
            <div className={styles.inputGroup}>
                <label className={styles.label}>Vehicle License Plate</label>
                <input 
                    type="text" 
                    placeholder="e.g. TN-07-AB-1234"
                    className={styles.glassInput} 
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                />
            </div>
          </div>

          {/* FIXED BOOKING CONTROLS */}
          <div className={styles.bookingControls}>
            <div className={styles.controlRow}>
              <div>
                <div className={styles.label}>Duration (Hours)</div>
                <div className={styles.counter}>
                   <button 
                     className={styles.counterBtn} 
                     onClick={() => setHours(Math.max(1, hours - 1))}
                   >-</button>
                   <span className={styles.countText}>{hours}h</span>
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
              {booking ? 'Reserving...' : (totalPrice > 0 ? 'Proceed to Payment' : 'Confirm Reservation')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingBookingModal;