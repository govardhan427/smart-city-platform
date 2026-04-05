/* src/components/transport/ParkingBookingModal.jsx */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import styles from './ParkingBookingModal.module.css';

// Official Indian State/UT Codes
const STATE_CODES = [
  'AP', 'AR', 'AS', 'BR', 'CG', 'CH', 'DD', 'DL', 'DN', 'GA', 'GJ', 'HP', 
  'HR', 'JH', 'JK', 'KA', 'KL', 'LA', 'LD', 'MH', 'ML', 'MN', 'MP', 'MZ', 
  'NL', 'OD', 'PB', 'PY', 'RJ', 'SK', 'TN', 'TR', 'TS', 'UK', 'UP', 'WB'
];

const ParkingBookingModal = ({ lot, onClose }) => {
  // Booking State
  const [hours, setHours] = useState(2);
  const [booking, setBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  
  // Segmented Plate State
  const [isSpecialPlate, setIsSpecialPlate] = useState(false);
  const [plateStateCode, setPlateStateCode] = useState('AP'); // Smart Default
  const [plateRto, setPlateRto] = useState('');
  const [plateSeries, setPlateSeries] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  
  // Fallback State for Special/BH Series
  const [specialPlateInput, setSpecialPlateInput] = useState('');

  // Refs for Auto-advancing inputs
  const rtoRef = useRef(null);
  const seriesRef = useRef(null);
  const numberRef = useRef(null);

  const navigate = useNavigate(); 
  const totalPrice = lot.rate_per_hour * hours;

  const mapsDeepLink = `https://www.google.com/maps/dir/?api=1&destination=$${
    lot.latitude && lot.longitude 
      ? `${lot.latitude},${lot.longitude}` 
      : encodeURIComponent(lot.location)
  }`;

  // Helper to construct the final plate string for validation and submission
  const getFinalPlateNumber = () => {
    if (isSpecialPlate) {
      return specialPlateInput.trim().toUpperCase();
    }
    const fullPlate = `${plateStateCode}${plateRto}${plateSeries}${plateNumber}`;
    return fullPlate.toUpperCase();
  };

  // Helper for the Visual HSRP Plate Display
  const getDisplayPlate = () => {
    if (isSpecialPlate) {
      return specialPlateInput.toUpperCase() || 'BH 1234 AA';
    }
    return `${plateStateCode} ${plateRto || '00'} ${plateSeries || 'XX'} ${plateNumber || '0000'}`;
  };

  // --- Handlers for auto-advancing segmented inputs ---
  const handleRtoChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, ''); // Numbers only
    setPlateRto(val);
    if (val.length === 2 && seriesRef.current) {
      seriesRef.current.focus(); // Auto-jump to series
    }
  };

  const handleSeriesChange = (e) => {
    const val = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase(); // Letters only
    setPlateSeries(val);
    // Auto-jump to number if user types 2 letters (common scenario)
    if (val.length === 2 && numberRef.current) {
      numberRef.current.focus(); 
    }
  };

  const handleNumberChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, ''); // Numbers only
    setPlateNumber(val);
  };

  const handleBook = async () => {
    const finalVehicleNumber = getFinalPlateNumber();

    // Basic Validation
    if (!isSpecialPlate && (plateRto.length < 1 || plateNumber.length < 1)) {
        toast.warning("Please fill out the complete license plate.");
        return;
    }
    if (isSpecialPlate && specialPlateInput.length < 4) {
        toast.warning("Please enter a valid special/BH series plate.");
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
                    vehicle_number: finalVehicleNumber,
                    duration_hours: hours
                }
            }
        });
        return;
    }

    setBooking(true);
    try {
      await api.post(`/transport/parking/${lot.id}/book/`, { 
          vehicle_number: finalVehicleNumber,
          duration_hours: hours
      });
      toast.success(`Spot reserved at ${lot.name}!`);
      setIsBooked(true);
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

        <div className={styles.imageSection}>
          <img 
              src={lot.image_url || "https://images.unsplash.com/photo-1470224114660-3f6686c562eb?auto=format&fit=crop&q=80"} 
              alt={lot.name} 
              className={styles.modalImage}
          />
          <div className={styles.imageOverlay}></div>
        </div>

        {isBooked ? (
          <div className={styles.contentSection} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px', animation: 'bounce 1s ease infinite' }}>🎉</div>
            <h2 style={{ color: 'white', marginBottom: '8px', fontSize: '1.8rem' }}>Reservation Confirmed!</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '30px', fontSize: '1rem' }}>
              Your parking spot at <strong>{lot.name}</strong> for {getFinalPlateNumber()} is secured.
            </p>
            <a href={mapsDeepLink} target="_blank" rel="noopener noreferrer" className={styles.buyBtn} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', fontSize: '1.1rem', padding: '16px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)', width: '100%' }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: '24px', height: '24px' }}>
                 <path d="M9 6a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3h0a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3zm3 3v12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                 <path d="M15 14l-3 3-3-3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
              </svg>
              Start Navigation
            </a>
            <button onClick={onClose} style={{ marginTop: '20px', background: 'transparent', border: 'none', color: '#60a5fa', fontWeight: 'bold', cursor: 'pointer', padding: '10px' }}>
              Close & Return to Hub
            </button>
          </div>
        ) : (
          <div className={styles.contentSection}>
            <div className={styles.scrollableArea}>
              <div className={styles.header}>
                <h2 className={styles.modalTitle}>{lot.name}</h2>
                <div className={styles.metaRow}>
                  <span className={styles.metaItem} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    📍 {lot.location}
                    <a href={mapsDeepLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#60a5fa', textDecoration: 'none', fontWeight: 'bold', background: 'rgba(59, 130, 246, 0.15)', padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)', whiteSpace: 'nowrap' }}>
                      Directions ↗
                    </a>
                  </span>
                  <span className={styles.metaItem}>🚗 {lot.available_spaces} / {lot.total_capacity} Spots Available</span>
                </div>
              </div>

              <div className={styles.divider}></div>

              {/* --- 1. VISUAL HSRP PLATE --- */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    background: '#ffffff', 
                    color: '#000000', 
                    padding: '8px 20px', 
                    borderRadius: '8px', 
                    border: '3px solid #1a1a1a', 
                    boxShadow: '0 4px 10px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.1)',
                    fontFamily: '"Courier New", Courier, monospace',
                    fontWeight: 'bold',
                    fontSize: '1.6rem',
                    letterSpacing: '3px'
                }}>
                   {/* Blue IND Badge Area */}
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '16px', paddingRight: '12px', borderRight: '2px solid #ccc' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #2563eb', marginBottom: '2px', position: 'relative' }}>
                         {/* Chakra dot */}
                         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '4px', height: '4px', background: '#2563eb', borderRadius: '50%'}}></div>
                      </div>
                      <span style={{ fontSize: '0.6rem', color: '#2563eb', letterSpacing: '0px' }}>IND</span>
                   </div>
                   {/* Live Typed Value */}
                   <span>{getDisplayPlate()}</span>
                </div>
              </div>

              {/* --- 2. SEGMENTED INPUTS --- */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Vehicle License Plate</label>
                
                {!isSpecialPlate ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* STATE CODE DROPDOWN */}
                    <select 
                      className={styles.glassSelect} 
                      value={plateStateCode}
                      onChange={(e) => setPlateStateCode(e.target.value)}
                      style={{ flex: 1, padding: '12px' }}
                    >
                      {STATE_CODES.map(code => (
                        <option key={code} value={code} style={{ color: '#000' }}>{code}</option>
                      ))}
                    </select>

                    {/* RTO CODE */}
                    <input 
                      type="text" 
                      ref={rtoRef}
                      maxLength={2}
                      placeholder="07"
                      className={styles.glassInput} 
                      value={plateRto}
                      onChange={handleRtoChange}
                      style={{ flex: 1, textAlign: 'center', padding: '12px' }}
                    />

                    {/* SERIES LETTERS */}
                    <input 
                      type="text" 
                      ref={seriesRef}
                      maxLength={2}
                      placeholder="AB"
                      className={styles.glassInput} 
                      value={plateSeries}
                      onChange={handleSeriesChange}
                      style={{ flex: 1, textAlign: 'center', padding: '12px' }}
                    />

                    {/* 4 DIGIT NUMBER */}
                    <input 
                      type="text" 
                      ref={numberRef}
                      maxLength={4}
                      placeholder="1234"
                      className={styles.glassInput} 
                      value={plateNumber}
                      onChange={handleNumberChange}
                      style={{ flex: 1.5, textAlign: 'center', padding: '12px' }}
                    />
                  </div>
                ) : (
                  // FALLBACK SINGLE INPUT FOR BH SERIES
                  <input 
                      type="text" 
                      placeholder="e.g. 21 BH 1234 AA"
                      className={styles.glassInput} 
                      value={specialPlateInput}
                      onChange={(e) => setSpecialPlateInput(e.target.value.toUpperCase())}
                  />
                )}

                {/* --- 3. BH SERIES TOGGLE --- */}
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#a1a1aa' }}>
                  <input 
                    type="checkbox" 
                    id="specialPlate"
                    checked={isSpecialPlate}
                    onChange={(e) => setIsSpecialPlate(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="specialPlate" style={{ cursor: 'pointer' }}>Special / BH Series format</label>
                </div>
              </div>

            </div>

            {/* FIXED BOOKING CONTROLS */}
            <div className={styles.bookingControls}>
              <div className={styles.controlRow}>
                <div>
                  <div className={styles.label}>Duration (Hours)</div>
                  <div className={styles.counter}>
                     <button className={styles.counterBtn} onClick={() => setHours(Math.max(1, hours - 1))}>-</button>
                     <span className={styles.countText}>{hours}h</span>
                     <button className={styles.counterBtn} onClick={() => setHours(Math.min(24, hours + 1))}>+</button>
                  </div>
                </div>

                <div style={{textAlign: 'right'}}>
                   <div className={styles.label}>Total Fee</div>
                   <div className={styles.totalPrice}>
                      {totalPrice === 0 ? "FREE" : `₹${totalPrice}`}
                   </div>
                </div>
              </div>

              <button className={styles.buyBtn} onClick={handleBook} disabled={booking}>
                {booking ? 'Reserving...' : (totalPrice > 0 ? 'Proceed to Payment' : 'Confirm Reservation')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingBookingModal;