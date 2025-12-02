import React from 'react';
import { Link } from 'react-router-dom';
import styles from './FacilityCard.module.css';

const FacilityCard = ({ facility }) => {
  // We don't need 'loading' here. We just render data.
  
  const price = parseFloat(facility.price || 0);

  return (
    <div className={styles.card}>
      {/* Image Section */}
      <div className={styles.imageWrapper}>
        <img 
          src={facility.image_url || 'https://placehold.co/600x400?text=Facility'} 
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
            <span style={{
              background: 'rgba(255, 187, 40, 0.2)', 
              color: '#FFBB28', 
              border: '1px solid #FFBB28', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontSize: '0.75rem', 
              fontWeight: 'bold'
            }}>
              ₹{price}
            </span>
          ) : (
            <span style={{
              background: 'rgba(0, 255, 157, 0.2)', 
              color: '#00FF9D', 
              border: '1px solid #00FF9D', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontSize: '0.75rem', 
              fontWeight: 'bold'
            }}>
              FREE
            </span>
          )}
        </div>

        {/* Location with Map Link */}
        <div className={styles.location}>
          {facility.google_maps_url ? (
            <a 
              href={facility.google_maps_url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{color: 'var(--primary-neon)', textDecoration: 'none'}}
            >
              📍 {facility.location} (Map)
            </a>
          ) : (
            <span>📍 {facility.location}</span>
          )}
        </div>

        <p className={styles.description}>{facility.description}</p>
        
        <div className={styles.footer}>
          <span className={styles.capacity}>
            Capacity: <strong>{facility.capacity}</strong>
          </span>
          
          <div className={styles.btnWrapper}>
             <Link to={`/facilities/${facility.id}/book`}>
               <button className={styles.btnPrimary} style={{
                 background: 'var(--primary-neon)',
                 color: 'black',
                 border: 'none',
                 padding: '8px 16px',
                 borderRadius: '6px',
                 fontWeight: 'bold',
                 cursor: 'pointer'
               }}>
                 Book
               </button>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityCard;