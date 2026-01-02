import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import transportService from '../services/transportService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import styles from './BookParkingPage.module.css'; // New dedicated styles
import { toast } from 'react-toastify';

const BookParkingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [vehicle, setVehicle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await transportService.bookParking(id, {
        vehicle_number: vehicle,
        start_time: startTime
      });
      toast.success("🚗 Parking Slot Reserved Successfully!");
      navigate('/parking');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error); 
        toast.error(err.response.data.error);
      } else {
        toast.error("Booking failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        
        {/* HEADER */}
        <div className={styles.header}>
            <div className={styles.icon}>🅿️</div>
            <h2 className={styles.title}>Secure Parking</h2>
            <p className={styles.subtitle}>Enter vehicle details to reserve your spot.</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}
        
        {/* INFO TIP */}
        <div className={styles.infoBox}>
            <span>ℹ️</span>
            <span>Billing starts from the estimated arrival time.</span>
        </div>
        
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
            label="Arrival Time"
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            min={new Date().toISOString().slice(0, 16)} // Prevent past dates
          />

          <div style={{marginTop: '10px'}}>
            <Button type="submit" disabled={loading} variant="primary" style={{width: '100%'}}>
              {loading ? 'Processing Reservation...' : 'Confirm Spot'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookParkingPage;