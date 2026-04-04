/* src/pages/MyFacilityBookingsPage.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import facilityService from '../services/facilityService';
import SkeletonCard from '../components/common/SkeletonCard'; // Consistent with your other pages
import styles from './MyFacilityBookingsPage.module.css';

const MyFacilityBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await facilityService.getMyBookings();
        setBookings(response.data || []);
      } catch (error) {
        console.error("Error fetching bookings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          ← Back
        </button>
        <h1 className={styles.title}>My Facility Reservations</h1>
      </div>

      {loading ? (
        <div className={styles.list}>
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏢</div>
          <h3>No reservations yet</h3>
          <p>Your booked community halls and sports courts will appear here.</p>
          <button onClick={() => navigate('/facilities')} className={styles.bookNowBtn}>
            Browse Facilities
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {bookings.map((booking) => (
            <div key={booking.id} className={styles.bookingCard}>
              
              <div className={styles.imageWrapper}>
                <img 
                  src={booking.facility_details?.image_url || 'https://placehold.co/150/101015/FFF?text=Facility'} 
                  alt={booking.facility_details?.name} 
                  className={styles.image}
                />
              </div>

              <div className={styles.info}>
                <h3 className={styles.facilityName}>{booking.facility_details?.name || 'Unknown Facility'}</h3>
                <p className={styles.location}>📍 {booking.facility_details?.location || 'City Metro Area'}</p>
                
                <div className={styles.dateTime}>
                  <span className={styles.dateTag}>📅 {booking.booking_date}</span>
                  <span className={styles.timeTag}>⏰ {booking.time_slot}</span>
                </div>
              </div>

              <div className={styles.statusArea}>
                <span className={styles.confirmedBadge}>
                  <span className={styles.dot}></span> Confirmed
                </span>
                <p className={styles.bookingId}>ID: {booking.id.toString().substring(0, 8)}</p>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFacilityBookingsPage;