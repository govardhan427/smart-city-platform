import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './NewsTicker.module.css';

const NewsTicker = () => {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get('/analytics/announcement/');
        if (res.data.message) {
          setMessage(res.data.message);
        }
      } catch (err) {
        console.error("News fetch error", err);
      }
    };
    fetchNews();
  }, []);

  if (!message) return null;

  return (
    <div className={styles.tickerContainer}>
      <div className={styles.label}>💠 CITY UPDATES</div>
      <div className={styles.scrollWrapper}>
        <div className={styles.scrollingText}>
          {message} &nbsp; • &nbsp; {message} &nbsp; • &nbsp; {message}
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;