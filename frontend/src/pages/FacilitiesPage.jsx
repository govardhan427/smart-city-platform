import React, { useState, useEffect } from 'react';
import facilityService from '../services/facilityService';
import FacilityCard from '../components/FacilityCard/FacilityCard';
import styles from './FacilitiesPage.module.css'; // We'll create this next

const FacilitiesPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await facilityService.getAllFacilities();
        setFacilities(response.data);
      } catch (error) {
        console.error("Failed to fetch facilities", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Public Facilities</h1>
      <p className={styles.subtitle}>Book city resources for your personal or community use.</p>

      {loading ? (
        <p>Loading...</p>
      ) : (
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