import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './NewsTicker.module.css';

const NewsTicker = () => {
  const [message, setMessage] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // This hits the endpoint we just used in AdminCreatePage
        const res = await api.get('/analytics/announcement/');
        if (res.data && res.data.message) {
          setMessage(res.data.message);
        }
      } catch (err) {
        console.error("News fetch error", err);
      }
    };

    fetchNews();
    // Refresh news every 60 seconds
    const interval = setInterval(fetchNews, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!message || !visible) return null;

  return (
    <div className={styles.tickerContainer}>
      <div className={styles.label}>
        <span className={styles.dot}></span> LIVE ALERT
      </div>
      <div className={styles.scrollingContent}>
        <span className={styles.text}>{message}</span>
        {/* Duplicate text for smooth infinite scroll effect */}
        <span className={styles.text}>{message}</span>
        <span className={styles.text}>{message}</span>
      </div>
      <button className={styles.closeBtn} onClick={() => setVisible(false)}>&times;</button>
    </div>
  );
};

export default NewsTicker;