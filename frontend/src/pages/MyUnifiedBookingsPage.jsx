import React, { useState, useEffect } from 'react';
import api from '../services/api';
// Use the common RegistrationCard for events
import RegistrationCard from '../components/RegistrationCard/RegistrationCard'; 
import styles from './MyUnifiedBookingsPage.module.css';
import SkeletonCard from '../components/common/SkeletonCard';

const MyUnifiedBookingsPage = () => {
  const [activeTab, setActiveTab] = useState('events'); // 'events', 'facilities', 'parking'
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [events, setEvents] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [parking, setParking] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Fetch all 3 endpoints in parallel
        const [eventsRes, facilitiesRes, parkingRes] = await Promise.all([
          api.get('/events/my-registrations/'),
          api.get('/facilities/my-bookings/'),
          api.get('/transport/my-parking/')
        ]);

        setEvents(eventsRes.data);
        setFacilities(facilitiesRes.data);
        setParking(parkingRes.data);
      } catch (error) {
        console.error("Error loading bookings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // --- RENDER HELPERS ---

  const renderEvents = () => {
    if (events.length === 0) return <div className={styles.empty}>No event tickets found.</div>;
    return (
      <div className={styles.list}>
        {events.map(reg => <RegistrationCard key={reg.id} registration={reg} />)}
      </div>
    );
  };

  const renderFacilities = () => {
    if (facilities.length === 0) return <div className={styles.empty}>No facility bookings found.</div>;
    return (
      <div className={styles.list}>
        {facilities.map(booking => (
          <div key={booking.id} className={styles.card}>
            <div className={styles.cardImageWrapper}>
              <img 
                src={booking.facility_details.image_url || 'https://placehold.co/150/101015/FFF?text=Facility'} 
                alt="Facility" 
                className={styles.cardImage}
              />
            </div>
            <div className={styles.cardContent}>
              <h3>{booking.facility_details.name}</h3>
              <p>📍 {booking.facility_details.location}</p>
              <div className={styles.tags}>
                <span className={styles.tagBlue}>📅 {booking.booking_date}</span>
                <span className={styles.tagOrange}>⏰ {booking.time_slot}</span>
              </div>
            </div>
            <div className={styles.statusBadge}>Confirmed</div>
          </div>
        ))}
      </div>
    );
  };

  const renderParking = () => {
    if (parking.length === 0) return <div className={styles.empty}>No parking reservations found.</div>;
    return (
      <div className={styles.list}>
        {parking.map(res => (
          <div key={res.id} className={styles.card}>
             <div className={styles.cardImageWrapper}>
              <img 
                src={res.parking_details.image_url || 'https://placehold.co/150/101015/FFF?text=Parking'} 
                alt="Parking" 
                className={styles.cardImage}
              />
            </div>
            <div className={styles.cardContent}>
              <h3>{res.parking_details.name}</h3>
              <p>📍 {res.parking_details.location}</p>
              <p style={{marginTop: '5px'}}><strong>Vehicle:</strong> {res.vehicle_number}</p>
              
              <div className={styles.tags}>
                <span className={styles.tagBlue}>
                  📅 {new Date(res.start_time).toLocaleDateString()}
                </span>
                <span className={styles.tagOrange}>
                  ⏰ {new Date(res.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
             <div className={styles.statusBadge}>Reserved</div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>My Bookings</h1>
        <div className={styles.list}>
          {[...Array(2)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>My Bookings</h1>

      {/* TABS */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'events' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Events ({events.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'facilities' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('facilities')}
        >
          Facilities ({facilities.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'parking' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('parking')}
        >
          Parking ({parking.length})
        </button>
      </div>
      {/* CONTENT */}
      <div className={styles.contentArea}>
        {activeTab === 'events' && renderEvents()}
        {activeTab === 'facilities' && renderFacilities()}
        {activeTab === 'parking' && renderParking()}
      </div>
    </div>
  );
};

export default MyUnifiedBookingsPage;