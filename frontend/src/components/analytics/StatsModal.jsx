import React, { useState, useEffect } from 'react';
import styles from './StatsModal.module.css';
import api from '../../services/api'; 

const StatsModal = ({ type, title, onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let response;
        let formattedData = [];

        // 1. STRICT REAL DATA FETCHING
        if (type === 'users') {
           // Endpoint: You need to create UserListView in users/views.py
           response = await api.get('/users/list/'); 
           
           formattedData = response.data.map(user => ({
             id: user.id,
             col1: user.username,
             col2: user.email,
             col3: user.is_staff ? 'Admin' : 'Citizen'
           }));
        } 
        else if (type === 'revenue') {
           // Endpoint: You need to create RevenueListView in analytics/views.py
           response = await api.get('/analytics/revenue/');
           
           formattedData = response.data.map(log => ({
             id: log.id,
             // Adjust these fields based on your actual Revenue model
             col1: log.description || log.source || 'Transaction', 
             col2: log.category || 'General',
             col3: `₹${log.amount}`
           }));
        }
        else if (type === 'activity') {
           // Endpoint: You need to create ActivityListView in analytics/views.py
           response = await api.get('/analytics/activity/');
           
           formattedData = response.data.map(log => ({
             id: log.id,
             // Adjust these fields based on your actual Activity model
             col1: log.action, 
             col2: log.username || 'System',
             col3: new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
           }));
        }

        setData(formattedData);

      } catch (err) {
        console.error(`Failed to fetch ${type}`, err);
        setError("Failed to load records from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  const getHeaders = () => {
    if (type === 'users') return ['Username', 'Email', 'Role'];
    if (type === 'revenue') return ['Source', 'Category', 'Amount'];
    if (type === 'activity') return ['Action', 'User', 'Time'];
    return ['Col 1', 'Col 2', 'Col 3'];
  };

  const headers = getHeaders();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.content}>
          {loading && (
            <div className={styles.loading}>
               <div className={styles.spinner}></div>
               <span>Accessing Secure Database...</span>
            </div>
          )}

          {!loading && error && (
            <div className={styles.loading} style={{color: '#fca5a5'}}>
               <span>⚠️ {error}</span>
            </div>
          )}

          {!loading && !error && data.length === 0 && (
            <div className={styles.loading}>
               <span>No records found.</span>
            </div>
          )}

          {!loading && !error && data.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  {headers.map((h, i) => <th key={i}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id}>
                    <td>{row.col1}</td>
                    <td>{row.col2}</td>
                    <td className={type === 'revenue' ? styles.green : ''}>{row.col3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsModal;