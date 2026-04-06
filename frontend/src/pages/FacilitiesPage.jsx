/* src/pages/FacilitiesPage.jsx */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // <-- ADDED ROUTER HOOKS
import api from '../services/api';
import FacilityBookingModal from '../components/facilities/FacilityBookingModal';
import styles from './FacilitiesPage.module.css';
import SkeletonCard from '../components/common/SkeletonCard';

const FacilitiesPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);

  const location = useLocation(); // <-- READ INVISIBLE STATE
  const navigate = useNavigate(); // <-- FOR CLEARING STATE

  // 1. FETCH DATA ONCE
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await api.get('/facilities/');
        setFacilities(response.data || []); 
      } catch (error) {
        console.error("Failed to load facilities", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  // 2. AUTO-OPEN MODAL IF ARRIVING FROM MAP
  useEffect(() => {
    if (facilities.length > 0 && location.state?.autoOpenFacilityId) {
        const targetFac = facilities.find(f => f.id === location.state.autoOpenFacilityId);
        if (targetFac) {
            setSelectedFacility(targetFac);
        }
    }
  }, [facilities, location.state]);

  // Helper to keep the grid uniform
  const truncateText = (text, limit = 75) => {
    if (!text) return "Secure your spot at this premier city facility.";
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  return (
    <div className={styles.container}>
      
      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.title}>Public Facilities</h1>
        <p className={styles.subtitle}>Book conference rooms, sports courts, and community halls.</p>
      </div>

      {/* GRID */}
      <div className={styles.grid}>
        {loading && (
            [...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
            ))
        )}

        {!loading && facilities.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No facilities available for booking.</h3>
            <p>Please check back later or contact city administration.</p>
          </div>
        )}

        {!loading && facilities.map((fac) => (
          <div 
            key={fac.id} 
            className={styles.card}
            onClick={() => setSelectedFacility(fac)}
          >
            <div className={styles.imageContainer}>
                <img 
                   src={fac.image_url || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80"} 
                   alt={fac.name} 
                   className={styles.cardImage}
                />
                
                <div className={`${styles.priceTag} ${Number(fac.price) === 0 ? styles.freeTag : ''}`}>
                   {Number(fac.price) > 0 ? `₹${fac.price}` : 'FREE'}
                </div>
            </div>

            <div className={styles.cardContent}>
               <h3 className={styles.cardTitle}>{fac.name}</h3>
               
               {fac.average_rating > 0 && (
                 <div className={styles.ratingRow}>
                    <span className={styles.star}>⭐</span>
                    <span className={styles.ratingValue}>{Number(fac.average_rating).toFixed(1)}</span>
                    <span className={styles.ratingMax}>/ 5.0</span>
                 </div>
               )}

               <div className={styles.cardMeta}>
                  <span className={styles.metaIcon}>🏢</span> 
                  <span className={styles.metaText}>Capacity: {fac.capacity} Persons</span>
               </div>

               <p className={styles.cardDesc}>
                 {truncateText(fac.description)}
               </p>

               <div className={styles.viewBtn}>
                 Check Availability &rarr;
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedFacility && (
        <FacilityBookingModal 
           facility={selectedFacility} 
           onClose={() => {
              setSelectedFacility(null);
              // PROPER CLEANUP: Clear router state on close
              navigate(location.pathname, { replace: true, state: {} });
           }} 
        />
      )}

    </div>
  );
};

export default FacilitiesPage;