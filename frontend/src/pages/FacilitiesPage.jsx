import React, { useState, useEffect } from 'react';
import facilityService from '../services/facilityService';
import FacilityCard from '../components/FacilityCard/FacilityCard';
import SkeletonCard from '../components/common/SkeletonCard';
import styles from './FacilitiesPage.module.css';

const FacilitiesPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        // Optional delay to see the glass skeleton effect
        // await new Promise(r => setTimeout(r, 800));
        
        const response = await facilityService.getAllFacilities();
        setFacilities(response.data);
      } catch (error) {
        console.error("Failed to fetch facilities", error);
        setError("Unable to access facility database.");
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  return (
    <div className={styles.container}>
      
      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.title}>Public Facilities</h1>
        <p className={styles.subtitle}>
          Reserve city resources, community halls, and sports grounds.
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
      {!loading && !error && facilities.length === 0 && (
         <div className={styles.stateContainer}>
            <div className={styles.emptyIcon}>🏛️</div>
            <h3>No Facilities Available</h3>
            <p>Please check back later.</p>
         </div>
      )}

      {/* DATA GRID */}
      {!loading && !error && facilities.length > 0 && (
        <div className={styles.grid}>
          {facilities.map((facility) => (
            <FacilityCard key={facility.id} facility={facility} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FacilitiesPage;