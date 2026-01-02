import React, { useEffect, useState } from 'react';
import analyticsService from '../../services/analyticsService';
import styles from './RosterModal.module.css';

const RosterModal = ({ type, item, onClose }) => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoster = async () => {
      try {
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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        
        {/* --- HEADER --- */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h2>{item.title || item.name}</h2>
            <div className={styles.badge}>{type.toUpperCase()} ROSTER</div>
          </div>
          
          <div className={styles.actions}>
            <button onClick={handleDownload} className={styles.downloadBtn} title="Download CSV">
               <span>📥</span> Export CSV
            </button>
            <button onClick={onClose} className={styles.closeBtn}>&times;</button>
          </div>
        </div>

        {/* --- CONTENT --- */}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
                <span className={styles.spinner}>●</span> Retrieving Records...
            </div>
          ) : (
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                <thead>
                    <tr>
                    <th style={{width: '35%'}}>Registered User</th>
                    <th style={{width: '35%'}}>Status / Info</th>
                    <th style={{width: '30%'}}>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {attendees.length === 0 ? (
                    <tr><td colSpan="3" className={styles.empty}>No active records found.</td></tr>
                    ) : (
                    attendees.map((person) => (
                        <tr key={person.id}>
                        <td className={styles.userCell}>
                            <div className={styles.avatar}>👤</div>
                            {person.user}
                        </td>
                        <td>
                            {person.extra ? (
                            <span>
                                <strong>{person.extra}</strong> 
                                <span className={styles.subStatus}> • {person.status}</span>
                            </span>
                            ) : (
                            <span className={person.status === 'Checked In' || person.status === 'Active' ? styles.statusGreen : styles.statusGray}>
                                {person.status}
                            </span>
                            )}
                        </td>
                        <td className={styles.timeCell}>{formatTime(person.time)}</td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RosterModal;