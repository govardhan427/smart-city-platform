import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ParkingBookingModal from '../components/transport/ParkingBookingModal';
import styles from './ParkingPage.module.css';
import SkeletonCard from '../components/common/SkeletonCard';

const ParkingPage = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLot, setSelectedLot] = useState(null);

  useEffect(() => {
    const fetchParking = async () => {
      try {
        const response = await api.get('/transport/parking/');
        setParkingLots(response.data);
      } catch (error) {
        console.error("Failed to load parking data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchParking();
  }, []);

  return (
    <div className={styles.container}>
      
      {/* HEADER (Visible even during loading) */}
      <div className={styles.header}>
        <h1 className={styles.title}>Smart Parking</h1>
        <p className={styles.subtitle}>Find available spots and reserve them instantly.</p>
      </div>

      {/* GRID */}
      <div className={styles.grid}>
        
        {/* LOADING STATE: Show Skeletons */}
        {loading && (
            [...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
            ))
        )}

        {/* LOADED STATE: Show Real Data */}
        {!loading && parkingLots.map((lot) => (
          <div 
            key={lot.id} 
            className={styles.card}
            onClick={() => setSelectedLot(lot)}
          >
            {/* Image */}
            <img 
               src={lot.image_url || "https://images.unsplash.com/photo-1470224114660-3f6686c562eb?auto=format&fit=crop&q=80"} 
               alt={lot.name} 
               className={styles.cardImage}
            />

            {/* Price Badge */}
            <div className={styles.priceTag}>
               ₹{lot.rate_per_hour}/hr
            </div>

            {/* Content Overlay */}
            <div className={styles.cardContent}>
               <h3 className={styles.cardTitle}>{lot.name}</h3>
               
               <div className={styles.cardMeta}>
                  <span>📍</span> {lot.location}
               </div>

               <p className={styles.cardDesc}>
                 Capacity: {lot.capacity} spots. Secure underground parking with 24/7 surveillance.
               </p>

               <div className={styles.viewBtn}>
                 Reserve Spot &rarr;
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedLot && (
        <ParkingBookingModal 
           lot={selectedLot} 
           onClose={() => setSelectedLot(null)} 
        />
      )}

    </div>
  );
};

export default ParkingPage;