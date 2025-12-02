import React, { useEffect, useState } from 'react';
import analyticsService from '../../services/analyticsService';
import styles from './RosterModal.module.css'; // We'll create this next

const RosterModal = ({ type, item, onClose }) => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        // 'item' is the object from the dashboard (event, facility, etc.)
        // We assume 'item.id' exists. If your dashboard aggregation didn't send IDs,
        // we might need to update the LiveOccupancyView to include 'id' in the response.
        const response = await analyticsService.getRoster(type, item.id);
        setAttendees(response.data);
      } catch (err) {
        console.error("Failed to load roster", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoster();
  }, [type, item]);

  // Helper to format timestamps
  const formatTime = (isoString) => {
    if (!isoString || isoString === '—') return '—';
    return new Date(isoString).toLocaleString();
  };
  const handleDownload = () => {
    analyticsService.downloadRosterCSV(type, item.id);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <h2>Details: {item.title || item.name}</h2>
            {/* DOWNLOAD BUTTON */}
            <button 
              onClick={handleDownload}
              style={{
                padding: '5px 10px', fontSize: '0.8rem', cursor: 'pointer',
                backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px'
              }}
            >
              📥 CSV
            </button>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>&times;</button>
        </div>

        <div className={styles.content}>
          {loading ? <p>Loading list...</p> : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status / Details</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {attendees.length === 0 ? (
                  <tr><td colSpan="3">No records found.</td></tr>
                ) : (
                  attendees.map((person) => (
                    <tr key={person.id}>
                      <td>{person.user}</td>
                      <td>
                        {person.extra ? (
                          <span><strong>{person.extra}</strong> ({person.status})</span>
                        ) : (
                          <span className={person.status === 'Checked In' ? styles.green : ''}>
                            {person.status}
                          </span>
                        )}
                      </td>
                      <td>{formatTime(person.time)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RosterModal;