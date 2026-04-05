/* src/pages/MyUnifiedBookingsPage.jsx */
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './MyUnifiedBookingsPage.module.css';
import SkeletonCard from '../components/common/SkeletonCard';
import ReviewModal from '../components/ReviewModal/ReviewModal';

const MyUnifiedBookingsPage = () => {
  const [activeTab, setActiveTab] = useState('events'); 
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [parking, setParking] = useState([]);

  const [reviewConfig, setReviewConfig] = useState({
    isOpen: false,
    type: '', 
    targetId: null,
    targetName: ''
  });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [eventsRes, facilitiesRes, parkingRes] = await Promise.all([
        api.get('/events/my-registrations/'),
        api.get('/facilities/my-bookings/'),
        api.get('/transport/my-parking/')
      ]);
      setEvents(eventsRes.data || []);
      setFacilities(facilitiesRes.data || []);
      setParking(parkingRes.data || []);
    } catch (error) {
      console.error("Error loading bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openReviewModal = (type, targetId, targetName) => {
    setReviewConfig({ isOpen: true, type, targetId, targetName });
  };

  const closeReviewModal = () => {
    setReviewConfig({ isOpen: false, type: '', targetId: null, targetName: '' });
  };

  const handleReviewSuccess = () => {
    closeReviewModal();
    fetchAllData(); 
  };

  // --- HELPER TO GENERATE DEEP LINK ---
  const getMapsLink = (itemDetails) => {
    if (!itemDetails) return '#';
    const query = (itemDetails.latitude && itemDetails.longitude) 
      ? `${itemDetails.latitude},${itemDetails.longitude}` 
      : encodeURIComponent(itemDetails.location || '');
    return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  };

  // --- RENDER HELPERS ---

  const renderEvents = () => {
    if (events.length === 0) return <div className={styles.empty}>No event tickets found.</div>;
    return (
      <div className={styles.list}>
        {events.map(reg => {
          const eventData = reg.event_details || reg.event || {};
          const isAttended = !!reg.attended_at;
          // FIX: Full ID extracted for manual verification
          const accessId = reg.id ? String(reg.id).toUpperCase() : 'N/A';

          return (
            <div key={reg.id} className={styles.card}>
              <div className={styles.cardImageWrapper}>
                <img 
                  src={eventData.image_url || 'https://placehold.co/150/101015/FFF?text=Event'} 
                  alt="Event" 
                  className={styles.cardImage}
                />
              </div>
              <div className={styles.cardContent}>
                <h3>{eventData.title || 'Event'}</h3>
                
                {/* --- INLINE DIRECTIONS LINK --- */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <p style={{ margin: 0 }}>📍 {eventData.location || 'Online'}</p>
                  {eventData.location && eventData.location.toLowerCase() !== 'online' && (
                    <a 
                      href={getMapsLink(eventData)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        fontSize: '0.75rem', color: '#60a5fa', textDecoration: 'none', fontWeight: 'bold', 
                        background: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: '8px',
                        border: '1px solid rgba(59, 130, 246, 0.3)', whiteSpace: 'nowrap'
                      }}
                    >
                      Directions ↗
                    </a>
                  )}
                </div>

                {/* FIX: Full ID displayed with word-break and monospace font */}
                <p style={{marginTop: '5px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', wordBreak: 'break-all'}}>
                  <strong>ACCESS ID:</strong> <span style={{fontFamily: 'monospace', color: 'white'}}>{accessId}</span>
                </p>

                <div className={styles.tags}>
                  <span className={styles.tagBlue}>📅 {eventData.date || 'TBD'}</span>
                  <span className={styles.tagOrange}>⏰ {eventData.time ? eventData.time.substring(0, 5) : 'TBD'}</span>
                </div>
              </div>
              <div className={styles.actionsColumn}>
                <div 
                  className={styles.statusBadge} 
                  style={isAttended ? { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)' } : {}}
                >
                  {isAttended ? 'Verified ✓' : 'Pending'}
                </div>
                {isAttended && (
                  <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px', textAlign: 'center' }}>
                    Entered: {new Date(reg.attended_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                )}
                {reg.can_review && (
                  <button 
                    className={styles.reviewBtn}
                    onClick={() => openReviewModal('event', eventData.id, eventData.title)}
                  >
                    ✨ Rate Experience
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFacilities = () => {
    if (facilities.length === 0) return <div className={styles.empty}>No facility bookings found.</div>;
    return (
      <div className={styles.list}>
        {facilities.map(booking => {
          // FIX: Extract full Access ID for Facility
          const accessId = booking.id ? String(booking.id).toUpperCase() : 'N/A';

          return (
            <div key={booking.id} className={styles.card}>
              <div className={styles.cardImageWrapper}>
                <img 
                  src={booking.facility_details?.image_url || 'https://placehold.co/150/101015/FFF?text=Facility'} 
                  alt="Facility" 
                  className={styles.cardImage}
                />
              </div>
              <div className={styles.cardContent}>
                <h3>{booking.facility_details?.name || 'Facility'}</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <p style={{ margin: 0 }}>📍 {booking.facility_details?.location || 'Location TBD'}</p>
                  <a 
                    href={getMapsLink(booking.facility_details)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      fontSize: '0.75rem', color: '#60a5fa', textDecoration: 'none', fontWeight: 'bold', 
                      background: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: '8px',
                      border: '1px solid rgba(59, 130, 246, 0.3)', whiteSpace: 'nowrap'
                    }}
                  >
                    Directions ↗
                  </a>
                </div>

                {/* FIX: Full ID displayed with word-break and monospace font */}
                <p style={{marginTop: '5px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', wordBreak: 'break-all'}}>
                  <strong>ACCESS ID:</strong> <span style={{fontFamily: 'monospace', color: 'white'}}>{accessId}</span>
                </p>

                <div className={styles.tags}>
                  <span className={styles.tagBlue}>📅 {booking.booking_date}</span>
                  <span className={styles.tagOrange}>⏰ {booking.time_slot}</span>
                </div>
              </div>
              <div className={styles.actionsColumn}>
                <div className={styles.statusBadge}>Confirmed</div>
                {booking.can_review && (
                  <button 
                    className={styles.reviewBtn}
                    onClick={() => openReviewModal('facility', booking.facility_details?.id, booking.facility_details?.name)}
                  >
                    ✨ Rate Experience
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderParking = () => {
    if (parking.length === 0) return <div className={styles.empty}>No parking reservations found.</div>;
    return (
      <div className={styles.list}>
        {parking.map(res => {
          // FIX: Extract full Access ID for Parking
          const accessId = res.id ? String(res.id).toUpperCase() : 'N/A';

          return (
            <div key={res.id} className={styles.card}>
               <div className={styles.cardImageWrapper}>
                <img 
                  src={res.parking_details?.image_url || 'https://placehold.co/150/101015/FFF?text=Parking'} 
                  alt="Parking" 
                  className={styles.cardImage}
                />
              </div>
              <div className={styles.cardContent}>
                <h3>{res.parking_details?.name || 'Parking Spot'}</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <p style={{ margin: 0 }}>📍 {res.parking_details?.location || 'Metro Area'}</p>
                  <a 
                    href={getMapsLink(res.parking_details)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      fontSize: '0.75rem', color: '#60a5fa', textDecoration: 'none', fontWeight: 'bold', 
                      background: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: '8px',
                      border: '1px solid rgba(59, 130, 246, 0.3)', whiteSpace: 'nowrap'
                    }}
                  >
                    Directions ↗
                  </a>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '5px', flexWrap: 'wrap' }}>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                    <strong>VEHICLE:</strong> {res.vehicle_number}
                  </p>
                  {/* FIX: Full ID displayed with word-break and monospace font */}
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: 0, wordBreak: 'break-all' }}>
                    <strong>ACCESS ID:</strong> <span style={{fontFamily: 'monospace', color: 'white'}}>{accessId}</span>
                  </p>
                </div>

                <div className={styles.tags} style={{ marginTop: '12px' }}>
                  <span className={styles.tagBlue}>📅 {new Date(res.start_time).toLocaleDateString()}</span>
                  <span className={styles.tagOrange}>⏰ {new Date(res.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
              <div className={styles.actionsColumn}><div className={styles.statusBadge}>Reserved</div></div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>My Bookings</h1>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'events' ? styles.activeTab : ''}`} onClick={() => setActiveTab('events')}>
          Events ({events.length})
        </button>
        <button className={`${styles.tab} ${activeTab === 'facilities' ? styles.activeTab : ''}`} onClick={() => setActiveTab('facilities')}>
          Facilities ({facilities.length})
        </button>
        <button className={`${styles.tab} ${activeTab === 'parking' ? styles.activeTab : ''}`} onClick={() => setActiveTab('parking')}>
          Parking ({parking.length})
        </button>
      </div>
      
      <div className={styles.contentArea}>
        {loading ? (
          <div className={styles.list}>
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {activeTab === 'events' && renderEvents()}
            {activeTab === 'facilities' && renderFacilities()}
            {activeTab === 'parking' && renderParking()}
          </>
        )}
      </div>

      <ReviewModal 
        isOpen={reviewConfig.isOpen}
        type={reviewConfig.type}
        targetId={reviewConfig.targetId}
        targetName={reviewConfig.targetName}
        onClose={closeReviewModal}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
};

export default MyUnifiedBookingsPage;