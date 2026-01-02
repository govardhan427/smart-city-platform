import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button'; // Assuming this is in the same folder structure
import styles from './ParkingCard.module.css';

const ParkingCard = ({ lot }) => {
  const isFull = lot.is_full;

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img 
            src={lot.image_url || 'https://placehold.co/600x300/101015/FFF?text=SmartParking'} 
            alt={lot.name} 
            className={styles.image}
        />
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{lot.name}</h3>
          
          {/* Live Status Indicator */}
          <span className={`${styles.badge} ${isFull ? styles.full : styles.available}`}>
            <span className={styles.led}></span>
            {isFull ? 'FULL' : `${lot.available_spaces} Open`}
          </span>
        </div>
        
        <p className={styles.location}>📍 {lot.location}</p>
        <p className={styles.rate}>₹{lot.rate_per_hour} <span>/ hour</span></p>

        <div className={styles.footer}>
          {isFull ? (
            <Button variant="error" disabled className={styles.fullBtn}>
               ⛔ Lot Full
            </Button>
          ) : (
            <Link to={`/parking/${lot.id}/book`}>
              <Button variant="primary">
                Reserve Slot
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkingCard;