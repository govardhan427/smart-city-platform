import React, { useEffect, useState } from 'react';
import api from '../services/api';
import FacilityBookingModal from '../components/facilities/FacilityBookingModal';
import styles from './FacilitiesPage.module.css';
import SkeletonCard from '../components/common/SkeletonCard'; // Import Skeleton

const FacilitiesPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await api.get('/facilities/');
        setFacilities(response.data);
      } catch (error) {
        console.error("Failed to load facilities", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  return (
    <div className={styles.container}>
      
      {/* HEADER (Visible during loading) */}
      <div className={styles.header}>
        <h1 className={styles.title}>Public Facilities</h1>
        <p className={styles.subtitle}>Book conference rooms, sports courts, and community halls.</p>
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
        {!loading && facilities.map((fac) => (
          <div 
            key={fac.id} 
            className={styles.card}
            onClick={() => setSelectedFacility(fac)}
          >
            {/* Image */}
            <img 
               src={fac.image_url || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80"} 
               alt={fac.name} 
               className={styles.cardImage}
            />

            {/* Price Badge */}
            <div className={styles.priceTag}>
               {fac.price > 0 ? `₹${fac.price}` : 'FREE'}
            </div>

            {/* Content Overlay */}
            <div className={styles.cardContent}>
               <h3 className={styles.cardTitle}>{fac.name}</h3>
               
               <div className={styles.cardMeta}>
                  <span>🏢</span> Capacity: {fac.capacity}
               </div>

               <p className={styles.cardDesc}>
                 {fac.description || "Click to check availability and book this facility."}
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
           onClose={() => setSelectedFacility(null)} 
        />
      )}

    </div>
  );
};

export default FacilitiesPage;