import React from 'react';
import styles from './SkeletonCard.module.css';

const SkeletonCard = () => {
  return (
    <div className={styles.skeleton}>
      <div className={styles.image}></div>
      <div className={styles.textShort}></div>
      <div className={styles.textLong}></div>
    </div>
  );
};

export default SkeletonCard;