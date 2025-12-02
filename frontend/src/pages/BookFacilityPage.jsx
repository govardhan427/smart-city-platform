import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import facilityService from '../services/facilityService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import styles from './BookFacilityPage.module.css';

const BookFacilityPage = () => {
  const { id } = useParams(); // Get facility ID from URL
  const navigate = useNavigate();
  
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] = useState(null);
  
  // Form State
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');

  // Hardcoded slots matching the backend choices
  const TIME_SLOTS = [
    { value: '09:00-11:00', label: 'Morning (9 AM - 11 AM)' },
    { value: '12:00-14:00', label: 'Afternoon (12 PM - 2 PM)' },
    { value: '15:00-17:00', label: 'Evening (3 PM - 5 PM)' },
    { value: '18:00-20:00', label: 'Night (6 PM - 8 PM)' },
  ];

  // Fetch facility details on mount
  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const response = await facilityService.getFacilityById(id);
        setFacility(response.data);
      } catch (error) {
        console.error("Error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFacility();
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError(null);

    if (!date || !timeSlot) {
      setBookingError("Please select both a date and a time slot.");
      return;
    }

    try {
      await facilityService.bookFacility(id, {
        booking_date: date,
        time_slot: timeSlot
      });
      // Redirect to a "My Bookings" page (we'll make this next)
      // For now, redirect to Home or alert
      alert("Booking Successful!");
      navigate('/facilities'); 
    } catch (err) {
      // Backend returns 400 if slot is taken
      if (err.response && err.response.data && err.response.data.error) {
        setBookingError(err.response.data.error);
      } else {
        setBookingError("Booking failed. Please try again.");
      }
    }
  };

  if (loading) return <div className={styles.loading}>Loading details...</div>;
  if (!facility) return <div className={styles.error}>Facility not found.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        
        {/* LEFT SIDE: Facility Info */}
        <div className={styles.infoSection}>
          <img 
            src={facility.image_url || 'https://placehold.co/600x400'} 
            alt={facility.name} 
            className={styles.image} 
          />
          <h1 className={styles.title}>{facility.name}</h1>
          <p className={styles.location}>📍 {facility.location}</p>
          <p className={styles.desc}>{facility.description}</p>
          <p className={styles.capacity}>Max Capacity: {facility.capacity} people</p>
        </div>

        {/* RIGHT SIDE: Booking Form */}
        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Reserve a Slot</h2>
            
            {bookingError && <div className={styles.errorBox}>{bookingError}</div>}
            
            <form onSubmit={handleBook}>
              <Input 
                label="Select Date"
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                // Prevent booking in the past
                min={new Date().toISOString().split('T')[0]} 
              />

              <div className={styles.selectGroup}>
                <label className={styles.label}>Select Time Slot</label>
                <select 
                  className={styles.select}
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  required
                >
                  <option value="">-- Choose a time --</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <Button type="submit" variant="primary">
                  Confirm Booking
                </Button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookFacilityPage;