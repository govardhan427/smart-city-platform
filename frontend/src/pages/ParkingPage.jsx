/* src/pages/ParkingPage.jsx */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // <-- ADDED ROUTER HOOKS
import api from '../services/api';
import ParkingBookingModal from '../components/transport/ParkingBookingModal';
import styles from './ParkingPage.module.css';
import SkeletonCard from '../components/common/SkeletonCard';

const ParkingPage = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLot, setSelectedLot] = useState(null);

  const location = useLocation(); // <-- READ INVISIBLE STATE
  const navigate = useNavigate(); // <-- FOR CLEARING STATE

  // 1. FETCH DATA ONCE
  useEffect(() => {
    const fetchParking = async () => {
      try {
        const response = await api.get('/transport/parking/');
        setParkingLots(response.data || []);
      } catch (error) {
        console.error("Failed to load parking data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchParking();
  }, []);

  // 2. AUTO-OPEN MODAL IF ARRIVING FROM MAP
  useEffect(() => {
    if (parkingLots.length > 0 && location.state?.autoOpenParkingId) {
        const targetLot = parkingLots.find(lot => lot.id === location.state.autoOpenParkingId);
        if (targetLot) {
            setSelectedLot(targetLot);
        }
    }
  }, [parkingLots, location.state]);

  // Helper to keep the grid uniform
  const truncateText = (text, limit = 80) => {
    if (!text) return "Secure underground parking with 24/7 surveillance and smart sensors.";
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  return (
    <div className={styles.container}>
      
      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.title}>Smart Parking</h1>
        <p className={styles.subtitle}>Find available spots and reserve them instantly via real-time sensors.</p>
      </div>

      {/* GRID */}
      <div className={styles.grid}>
        
        {/* LOADING STATE */}
        {loading && (
            [...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
            ))
        )}

        {/* EMPTY STATE */}
        {!loading && parkingLots.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🚗</div>
            <h3>No parking lots found</h3>
            <p>We couldn't find any available parking areas in your current zone.</p>
          </div>
        )}

        {/* LOADED STATE */}
        {!loading && parkingLots.map((lot) => (
          <div 
            key={lot.id} 
            className={styles.card}
            onClick={() => setSelectedLot(lot)}
          >
            <div className={styles.imageContainer}>
                <img 
                   src={lot.image_url || "https://images.unsplash.com/photo-1470224114660-3f6686c562eb?auto=format&fit=crop&q=80"} 
                   alt={lot.name} 
                   className={styles.cardImage}
                />

                <div className={styles.priceTag}>
                   ₹{lot.rate_per_hour}/hr
                </div>
            </div>

            <div className={styles.cardContent}>
               <h3 className={styles.cardTitle}>{lot.name}</h3>
               
               <div className={styles.cardMeta}>
                  <span className={styles.metaIcon}>📍</span> 
                  <span className={styles.metaText}>{lot.location}</span>
               </div>

               {/* SHOW SPOTS LEFT */}
               <div className={styles.availability}>
                  <span className={styles.spotCount}>
                    {lot.available_spaces} / {lot.total_capacity} Spots Available
                  </span>
                  <span className={styles.statusDot}></span>
                </div>
               <p className={styles.cardDesc}>
                 {truncateText(lot.description)}
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
            onClose={() => {
                setSelectedLot(null);
                // PROPER CLEANUP: Clear router state on close
                navigate(location.pathname, { replace: true, state: {} });
            }} 
        />
      )}

    </div>
  );
};

export default ParkingPage;