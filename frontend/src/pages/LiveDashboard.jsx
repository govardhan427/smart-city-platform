import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './LiveDashboard.module.css';
import RosterModal from '../components/common/RosterModal'; // Ensure path is correct

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
    const interval = setInterval(fetchData, 5000); // Fetch every 5 seconds
    return () => clearInterval(interval); // Cleanup
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
    <div className={styles.loading}>
        <span>📡</span> Connecting to Live Feed...
    </div>
  );

  return (
    <div className={styles.container}>
      
      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.title}>Live Operations</h1>
        <div className={styles.pulse}>Monitoring Active</div>
      </div>

      {/* TABS */}
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
        {activeTab === 'events' && data.events.map((evt) => (
          <div 
            key={evt.id} 
            className={styles.card} 
            onClick={() => handleCardClick(evt)}
            style={{borderLeftColor: '#3b82f6'}} // Blue Status Bar
          >
            <h3>{evt.title}</h3>
            <div className={styles.statRow}>
              <span>Registered: <strong>{evt.registered}</strong></span>
              <span>Checked In: <strong className={styles.green}>{evt.checked_in}</strong></span>
            </div>
            
            <div className={styles.progressContainer}>
              <div 
                className={styles.progressBar} 
                style={{
                    width: `${(evt.checked_in / (evt.registered || 1)) * 100}%`,
                    background: '#3b82f6',
                    boxShadow: '0 0 10px #3b82f6'
                }}
              ></div>
            </div>
          </div>
        ))}

        {/* --- FACILITIES TAB --- */}
        {activeTab === 'facilities' && data.facilities.map((fac) => (
          <div 
            key={fac.id} 
            className={styles.card} 
            onClick={() => handleCardClick(fac)}
            style={{borderLeftColor: '#f59e0b'}} // Amber Status Bar
          >
            <h3>{fac.name}</h3>
            <div className={styles.statRow}>
              <span>Capacity: <strong>{fac.capacity}</strong></span>
              <span>Booked: <strong>{fac.booked_count}</strong></span>
            </div>
            <div className={styles.progressContainer}>
              <div 
                className={styles.progressBar} 
                style={{
                    width: `${(fac.booked_count / fac.capacity) * 100}%`, 
                    backgroundColor: '#f59e0b',
                    boxShadow: '0 0 10px #f59e0b'
                }}
              ></div>
            </div>
          </div>
        ))}

        {/* --- PARKING TAB --- */}
        {activeTab === 'parking' && data.parking.map((lot) => (
          <div 
            key={lot.id} 
            className={styles.card} 
            onClick={() => handleCardClick(lot)}
            style={{borderLeftColor: '#ef4444'}} // Red Status Bar
          >
            <h3>{lot.name}</h3>
            <p className={styles.bigStat}>
              {lot.capacity - lot.occupied} 
              <span className={styles.small}>/ {lot.capacity} spots open</span>
            </p>
            
            {/* Occupancy Bar */}
            <div className={styles.progressContainer}>
              <div 
                className={styles.progressBar} 
                style={{
                    width: `${((lot.capacity - lot.occupied) / lot.capacity) * 100}%`, 
                    backgroundColor: '#ef4444',
                    boxShadow: '0 0 10px #ef4444'
                }}
              ></div>
            </div>
          </div>
        ))}

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