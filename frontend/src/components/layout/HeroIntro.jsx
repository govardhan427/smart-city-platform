import React, { useEffect, useState } from 'react';
import styles from './HeroIntro.module.css';

const HeroIntro = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hide animation after 2.5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete(); // Tell App to show content
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>SMART ACCESS HUB</h1>
        <p className={styles.subtitle}>INITIALIZING URBAN SYSTEMS...427</p>
        <div className={styles.scanLine}></div>
        <div className={styles.loader}></div>
      </div>
    </div>
  );
};

export default HeroIntro;