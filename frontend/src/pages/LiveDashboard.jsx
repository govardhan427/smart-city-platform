import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './LiveDashboard.module.css';
import RosterModal from '../components/common/RosterModal'; // Updated path based on previous context

const LiveDashboard = () => {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('events');
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/analytics/live/');
      setData(res.data);
    } catch (err) {
      console.error("Live fetch error", err);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch immediately
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };
  
  const getApiType = (tabName) => {
    if (tabName === 'events') return 'event';
    if (tabName === 'facilities') return 'facility';
    return 'parking';
  };

  if (!data) return (
    <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <div>Loading live data...</div>
    </div>
  );

  return (
    <div className={styles.container}>
      
      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.title}>Live Operations</h1>
        <div className={styles.pulse}>Monitoring Active</div>
      </div>

      {/* TABS (Segmented Control) */}
      <div className={styles.tabs}>
        <button 
            className={activeTab === 'events' ? styles.active : ''} 
            onClick={() => setActiveTab('events')}
        >
            Events
        </button>
        <button 
            className={activeTab === 'facilities' ? styles.active : ''} 
            onClick={() => setActiveTab('facilities')}
        >
            Facilities
        </button>
        <button 
            className={activeTab === 'parking' ? styles.active : ''} 
            onClick={() => setActiveTab('parking')}
        >
            Parking
        </button>
      </div>

      {/* GRID */}
      <div className={styles.grid}>
        
        {/* --- EVENTS TAB --- */}
        {activeTab === 'events' && data.events.map((evt) => {
           const percentage = Math.round((evt.checked_in / (evt.registered || 1)) * 100);
           
           return (
            <div key={evt.id} className={styles.card} onClick={() => handleCardClick(evt)}>
              <h3>{evt.title}</h3>
              
              <div className={styles.statRow}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Registered</span>
                    <span className={styles.statValue}>{evt.registered}</span>
                </div>
                <div className={styles.statItem} style={{textAlign: 'right'}}>
                    <span className={styles.statLabel}>Checked In</span>
                    <span className={`${styles.statValue} ${styles.green}`}>{evt.checked_in}</span>
                </div>
              </div>
              
              <div className={styles.progressContainer}>
                <div 
                  className={styles.progressBar} 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}

        {/* --- FACILITIES TAB --- */}
        {activeTab === 'facilities' && data.facilities.map((fac) => {
           const percentage = Math.round((fac.booked_count / fac.capacity) * 100);
           
           return (
            <div key={fac.id} className={styles.card} onClick={() => handleCardClick(fac)}>
              <h3>{fac.name}</h3>
              
              <div className={styles.statRow}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Capacity</span>
                    <span className={styles.statValue}>{fac.capacity}</span>
                </div>
                <div className={styles.statItem} style={{textAlign: 'right'}}>
                    <span className={styles.statLabel}>Booked Today</span>
                    <span className={`${styles.statValue} ${styles.green}`}>{fac.booked_count}</span>
                </div>
              </div>

              <div className={styles.progressContainer}>
                <div 
                  className={styles.progressBar} 
                  style={{ 
                      width: `${percentage}%`,
                      // Dynamic color: Red if > 80% full
                      background: percentage > 80 ? '#ef4444' : undefined 
                  }}
                ></div>
              </div>
            </div>
          );
        })}

        {/* --- PARKING TAB --- */}
        {activeTab === 'parking' && data.parking.map((lot) => {
           // FIX: Backend sends 'available_spaces' as the key 'occupied'
           const availableSpots = lot.occupied; 
           const takenSpots = lot.capacity - availableSpots;
           
           // Percentage should represent how FULL the lot is
           const percentage = Math.round((takenSpots / lot.capacity) * 100);

           return (
            <div key={lot.id} className={styles.card} onClick={() => handleCardClick(lot)}>
              <h3>{lot.name}</h3>
              
              <div className={styles.statRow}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Available Spots</span>
                    {/* Display the value directly from API since it is the available count */}
                    <span className={`${styles.statValue} ${styles.green}`}>{availableSpots}</span>
                </div>
                <div className={styles.statItem} style={{textAlign: 'right'}}>
                    <span className={styles.statLabel}>Total Capacity</span>
                    <span className={styles.statValue}>{lot.capacity}</span>
                </div>
              </div>
              
              <div className={styles.progressContainer}>
                <div 
                  className={styles.progressBar} 
                  style={{ 
                      width: `${percentage}%`,
                      // Red if > 90% FULL (not empty)
                      background: percentage > 90 ? '#ef4444' : '#10b981'
                  }}
                ></div>
              </div>
            </div>
          );
        })}

      </div>

      {/* MODAL */}
      {selectedItem && (
        <RosterModal 
          type={getApiType(activeTab)} 
          item={selectedItem} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};

export default LiveDashboard;