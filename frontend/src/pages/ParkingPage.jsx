import React, { useState, useEffect } from 'react';
import transportService from '../services/transportService';
import ParkingCard from '../components/ParkingCard/ParkingCard';
import styles from './FacilitiesPage.module.css'; // Reusing existing grid styles

const ParkingPage = () => {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParking = async () => {
      try {
        const response = await transportService.getAllParking();
        setLots(response.data);
      } catch (error) {
        console.error("Error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchParking();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Smart Parking</h1>
      <p className={styles.subtitle}>Check real-time availability and reserve your spot.</p>

      {loading ? <p>Loading...</p> : (
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