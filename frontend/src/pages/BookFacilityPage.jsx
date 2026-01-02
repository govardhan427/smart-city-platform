import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import facilityService from '../services/facilityService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import styles from './BookFacilityPage.module.css';
import { toast } from 'react-toastify';

const BookFacilityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] = useState(null);
  
  // Form State
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');

  const TIME_SLOTS = [
    { value: '09:00-11:00', label: 'Morning (09:00 - 11:00)' },
    { value: '12:00-14:00', label: 'Midday (12:00 - 14:00)' },
    { value: '15:00-17:00', label: 'Afternoon (15:00 - 17:00)' },
    { value: '18:00-20:00', label: 'Evening (18:00 - 20:00)' },
  ];

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const response = await facilityService.getFacilityById(id);
        setFacility(response.data);
      } catch (error) {
        console.error("Error", error);
        toast.error("Could not load facility details.");
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
      toast.warning("Please select both a date and a time slot.");
      return;
    }

    try {
      await facilityService.bookFacility(id, {
        booking_date: date,
        time_slot: timeSlot
      });
      toast.success("✅ Booking Confirmed! Check your email.");
      navigate('/facilities'); 
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setBookingError(err.response.data.error);
        toast.error(err.response.data.error);
      } else {
        toast.error("Booking failed. Please try again.");
      }
    }
  };

  if (loading) return <div className={styles.loading}>Accessing Facility Database...</div>;
  if (!facility) return <div className={styles.error}>Facility Not Found.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        
        {/* LEFT SIDE: Visuals & Info */}
        <div className={styles.infoSection}>
          <div className={styles.imageWrapper}>
            <img 
              src={facility.image_url || 'https://placehold.co/600x400/101015/FFF?text=Facility'} 
              alt={facility.name} 
              className={styles.image} 
            />
            <div className={styles.overlayGradient}></div>
          </div>
          
          <div className={styles.details}>
            <h1 className={styles.title}>{facility.name}</h1>
            <p className={styles.location}>📍 {facility.location}</p>
            <div className={styles.divider}></div>
            <p className={styles.desc}>{facility.description}</p>
            
            <div className={styles.metaRow}>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Capacity</span>
                    <span className={styles.metaValue}>{facility.capacity} Persons</span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Base Rate</span>
                    <span className={styles.metaValue}>{parseFloat(facility.price) > 0 ? `₹${facility.price}` : 'Free'}</span>
                </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Booking Form */}
        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Secure Reservation</h2>
            
            {bookingError && <div className={styles.errorBox}>{bookingError}</div>}
            
            <form onSubmit={handleBook} className={styles.form}>
              <Input 
                label="Select Date"
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]} 
              />

              <div className={styles.selectGroup}>
                <label className={styles.label}>Time Slot</label>
                <div className={styles.selectWrapper}>
                    <select 
                    className={styles.select}
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    required
                    >
                    <option value="">-- Select Time --</option>
                    {TIME_SLOTS.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                        {slot.label}
                        </option>
                    ))}
                    </select>
                    <div className={styles.selectArrow}>▼</div>
                </div>
              </div>

              <div className={styles.summary}>
                <p>Reservation for <strong>{date || '...'}</strong></p>
                <p>at <strong>{timeSlot ? TIME_SLOTS.find(t=>t.value===timeSlot)?.label : '...'}</strong></p>
              </div>

              <div style={{ marginTop: 'auto' }}>
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