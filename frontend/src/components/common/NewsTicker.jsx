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
    <div className={styles.wrapper}>
        <div className={styles.tickerContainer}>
        {/* The Glass Badge */}
        <div className={styles.label}>
            <span className={styles.dot}>●</span> 
            SYSTEM ALERT
        </div>
        
        {/* The Scrolling Text Area */}
        <div className={styles.scrollWrapper}>
            <div className={styles.scrollingText}>
            {/* Repeat message 4 times for smooth infinite loop on wide screens */}
            {message} &nbsp; • &nbsp; 
            {message} &nbsp; • &nbsp; 
            {message} &nbsp; • &nbsp; 
            {message} &nbsp; • &nbsp;
            </div>
        </div>
        </div>
    </div>
  );
};

export default NewsTicker;