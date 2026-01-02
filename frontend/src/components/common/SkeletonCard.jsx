import React from 'react';
import styles from './SkeletonCard.module.css';

const SkeletonCard = () => {
  return (
    <div className={styles.skeleton}>
      {/* Fake Icon */}
      <div className={styles.image}></div>
      
      {/* Fake Title */}
      <div className={styles.textShort}></div>
      
      {/* Fake Description (Two lines for realism) */}
      <div className={styles.textLong}></div>
      <div className={styles.textLong} style={{ width: '70%' }}></div>
    </div>
  );
};

export default SkeletonCard;