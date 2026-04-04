/* src/pages/BookFacilityPage.jsx */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import facilityService from '../services/facilityService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import FeedbackSection from '../components/FeedbackSection/FeedbackSection';
import styles from './BookFacilityPage.module.css';
import { toast } from 'react-toastify';

const BookFacilityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] = useState(null);
  
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
        console.error("Error loading facility:", error);
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
      const errorMsg = err.response?.data?.error || "Booking failed. Please try again.";
      setBookingError(errorMsg);
      toast.error(errorMsg);
    }
  };

  if (loading) return <div className={styles.loading}>Accessing Facility Database...</div>;
  if (!facility) return <div className={styles.error}>Facility Not Found.</div>;

  return (
    <div className={styles.container}>
      {/* Navigation Header */}
      <div className={styles.navHeader}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          ← Back to Facilities
        </button>
      </div>

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
            
            {/* ENHANCED RATING PILL */}
            {facility.average_rating > 0 && (
              <div className={styles.ratingPill}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>{Number(facility.average_rating).toFixed(1)} / 5.0</span>
              </div>
            )}

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
                    <span className={styles.metaValue}>
                      {parseFloat(facility.price) > 0 ? `₹${facility.price}` : 'Free'}
                    </span>
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

      <FeedbackSection reviews={facility.reviews} />
    </div>
  );
};

export default BookFacilityPage;