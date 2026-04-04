/* src/pages/BookParkingPage.jsx */
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import transportService from '../services/transportService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import styles from './BookParkingPage.module.css';
import { toast } from 'react-toastify';

const BookParkingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [vehicle, setVehicle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get local date-time string for the "min" attribute
  const minDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await transportService.bookParking(id, {
        vehicle_number: vehicle.trim(),
        start_time: startTime
      });
      toast.success("🚗 Parking Slot Reserved Successfully!");
      navigate('/parking');
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Booking failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        
        {/* HEADER */}
        <div className={styles.header}>
            <div className={styles.iconCircle}>🅿️</div>
            <h2 className={styles.title}>Secure Parking</h2>
            <p className={styles.subtitle}>Reserve your smart-sensor parking spot.</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}
        
        <form onSubmit={handleBook} className={styles.form}>
          <Input 
            label="Vehicle License Plate"
            id="vehicle"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value.toUpperCase())}
            required
            placeholder="e.g. MH-12-AB-1234"
          />
          
          <Input 
            label="Estimated Arrival Time"
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            min={minDateTime} 
          />

          <div className={styles.infoBox}>
              <span className={styles.infoIcon}>ℹ️</span>
              <p>Billing cycle activates at the selected arrival time.</p>
          </div>

          <div className={styles.actions}>
            <Button 
              type="submit" 
              disabled={loading} 
              variant="primary" 
              className={styles.submitBtn}
            >
              {loading ? 'Processing...' : 'Confirm Reservation'}
            </Button>
            
            <button 
              type="button" 
              className={styles.cancelBtn}
              onClick={() => navigate('/parking')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookParkingPage;