import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import transportService from '../services/transportService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import styles from './BookFacilityPage.module.css'; // Reuse form styles

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
      alert("Parking Spot Reserved!");
      navigate('/parking');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error); // Show "Lot is Full" error
      } else {
        setError("Booking failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard} style={{maxWidth: '500px', margin: '2rem auto'}}>
        <h2 className={styles.formTitle}>Reserve Parking Spot</h2>
        {error && <div className={styles.errorBox}>{error}</div>}
        
        <form onSubmit={handleBook}>
          <Input 
            label="Vehicle Number Plate"
            id="vehicle"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            required
            placeholder="e.g. KA-01-AB-1234"
          />
          
          <Input 
            label="Estimated Arrival Time"
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />

          <div style={{marginTop: '1.5rem'}}>
            <Button type="submit" disabled={loading}>
              {loading ? 'Reserving...' : 'Confirm Reservation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookParkingPage;