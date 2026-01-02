import React from 'react';
import { Link } from 'react-router-dom';
import styles from './FacilityCard.module.css';

const FacilityCard = ({ facility }) => {
  const price = parseFloat(facility.price || 0);

  return (
    <div className={styles.card}>
      {/* Image Section */}
      <div className={styles.imageWrapper}>
        <img 
          src={facility.image_url || 'https://placehold.co/600x400/1e1e24/FFF?text=Facility'} 
          alt={facility.name} 
          className={styles.image}
        />
      </div>

      {/* Content Section */}
      <div className={styles.content}>
        {/* Header with Price Badge */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <h3 className={styles.title}>{facility.name}</h3>
          
          {price > 0 ? (
            <span className={`${styles.badge} ${styles.paid}`}>
              ₹{price}
            </span>
          ) : (
            <span className={`${styles.badge} ${styles.free}`}>
              FREE
            </span>
          )}
        </div>

        {/* Location with Map Link */}
        <div className={styles.location}>
          <span>📍</span>
          {facility.google_maps_url ? (
            <a 
              href={facility.google_maps_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.mapLink}
            >
              {facility.location} (Map)
            </a>
          ) : (
            <span>{facility.location}</span>
          )}
        </div>

        <p className={styles.description}>
            {facility.description?.length > 100 
                ? facility.description.substring(0, 100) + '...' 
                : facility.description}
        </p>
        
        <div className={styles.footer}>
          <span className={styles.capacity}>
            Capacity: <strong>{facility.capacity}</strong>
          </span>
          
          <div className={styles.btnWrapper}>
             <Link to={`/facilities/${facility.id}/book`}>
               <button className={styles.bookBtn}>
                 Book Now
               </button>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityCard;