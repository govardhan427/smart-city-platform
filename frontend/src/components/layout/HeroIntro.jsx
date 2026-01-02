import React, { useEffect, useState } from 'react';
import styles from './HeroIntro.module.css';

const HeroIntro = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 1. Wait for animation to finish (2.5s)
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete(); 
    }, 2500); 

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className={styles.container}>
      {/* The Liquid Glow Background */}
      <div className={styles.orb}></div>

      <div className={styles.content}>
        <h1 className={styles.title}>Smart Access Hub </h1>
        <div className={styles.subtitle}>for Urban Mobility </div>
      </div>
    </div>
  );
};

export default HeroIntro;