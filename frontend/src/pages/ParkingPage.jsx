import React, { useState, useEffect } from 'react';
import transportService from '../services/transportService';
import ParkingCard from '../components/ParkingCard/ParkingCard';
import SkeletonCard from '../components/common/SkeletonCard';
import styles from './ParkingPage.module.css';

const ParkingPage = () => {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParking = async () => {
      try {
        // Optional delay to see the glass skeleton effect
        // await new Promise(r => setTimeout(r, 800));
        
        const response = await transportService.getAllParking();
        setLots(response.data);
      } catch (error) {
        console.error("Error", error);
        setError("Unable to connect to parking sensors.");
      } finally {
        setLoading(false);
      }
    };
    fetchParking();
  }, []);

  return (
    <div className={styles.container}>
      
      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.title}>Smart Parking</h1>
        <p className={styles.subtitle}>
          Real-time occupancy tracking and slot reservation.
        </p>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className={styles.grid}>
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
         <div className={styles.stateContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <div className={styles.errorText}>{error}</div>
         </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && lots.length === 0 && (
         <div className={styles.stateContainer}>
            <div className={styles.emptyIcon}>🅿️</div>
            <h3>No Parking Lots Found</h3>
            <p>Please check back later.</p>
         </div>
      )}

      {/* DATA GRID */}
      {!loading && !error && lots.length > 0 && (
        <div className={styles.grid}>
          {lots.map((lot) => (
            <ParkingCard key={lot.id} lot={lot} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ParkingPage;