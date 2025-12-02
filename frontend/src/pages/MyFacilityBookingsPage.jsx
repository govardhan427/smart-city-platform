import React, { useState, useEffect } from 'react';
import facilityService from '../services/facilityService';
import styles from './MyFacilityBookingsPage.module.css'; // We'll create this next

const MyFacilityBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await facilityService.getMyBookings();
        setBookings(response.data);
      } catch (error) {
        console.error("Error fetching bookings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <div className={styles.loading}>Loading bookings...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Facility Reservations</h1>

      {bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You haven't booked any facilities yet.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {bookings.map((booking) => (
            <div key={booking.id} className={styles.bookingCard}>
              
              {/* Image Section */}
              <div className={styles.imageWrapper}>
                <img 
                  src={booking.facility_details.image_url || 'https://placehold.co/100x100'} 
                  alt={booking.facility_details.name} 
                  className={styles.image}
                />
              </div>

              {/* Info Section */}
              <div className={styles.info}>
                <h3 className={styles.facilityName}>{booking.facility_details.name}</h3>
                <p className={styles.location}>📍 {booking.facility_details.location}</p>
                <div className={styles.dateTime}>
                  <span className={styles.dateTag}>{booking.booking_date}</span>
                  <span className={styles.timeTag}>{booking.time_slot}</span>
                </div>
              </div>

              {/* Status Badge (Static for now) */}
              <div className={styles.status}>
                <span className={styles.confirmedBadge}>Confirmed</span>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFacilityBookingsPage;