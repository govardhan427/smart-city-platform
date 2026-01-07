import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import DashboardCard from '../components/DashboardCard/DashboardCard';
import RecommendationSection from '../components/RecommendationSection/RecommendationSection';
import ParkingPredictor from '../components/ParkingPredictor/ParkingPredictor';
import styles from './HomePage.module.css';

const HomePage = () => {
  const { user } = useAuth();
  
  // State to manage the Smart Bar (null = hidden)
  const [activeFeature, setActiveFeature] = useState(null); 

  const getDisplayName = () => {
    if (!user) return 'CITIZEN';
    if (user.username && user.username.length > 0) return user.username;
    if (user.email) return user.email.split('@')[0];
    return 'CITIZEN';
  };

  const toggleFeature = (feature) => {
    // If clicking the same button, close it. Otherwise, open the new one.
    setActiveFeature(prev => prev === feature ? null : feature);
  };

  return (
    <div className={styles.container}>
      
      {/* 1. HERO SECTION */}
      <div className={styles.hero}>
        <div className={styles.badge}>
           <span className={styles.pulse}>●</span> System Online
        </div>
        <h1 className={styles.greeting}>
          Welcome back, <span className={styles.username}>{getDisplayName()}</span>
        </h1>
        <p className={styles.subtitle}>
          Unified access control for city events, parking, and facility management.
        </p>
      </div>

      {/* 2. SMART INSIGHTS (Logged In Only) */}
      {user && (
        <div className={styles.smartSection}>
          <div className={styles.toggleBar}>
            <button 
              className={`${styles.toggleBtn} ${activeFeature === 'recommend' ? styles.activeBtn : ''}`}
              onClick={() => toggleFeature('recommend')}
            >
              <span><svg
  width="18"
  height="18"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinejoin="round"
  />
</svg>
</span> For You
            </button>
            <button 
              className={`${styles.toggleBtn} ${activeFeature === 'predict' ? styles.activeBtn : ''}`}
              onClick={() => toggleFeature('predict')}
            >
              <span><svg
  width="18"
  height="18"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <rect
    x="7"
    y="2"
    width="10"
    height="20"
    rx="3"
    stroke="currentColor"
    strokeWidth="1.6"
  />
  <circle cx="12" cy="7" r="1.6" fill="currentColor" />
  <circle cx="12" cy="12" r="1.6" fill="currentColor" />
  <circle cx="12" cy="17" r="1.6" fill="currentColor" />
</svg>
</span> Traffic Forecast
            </button>
          </div>

          {/* Conditional Content Area */}
          <div className={styles.contentArea}>
            {activeFeature === 'recommend' && <RecommendationSection />}
            {activeFeature === 'predict' && <ParkingPredictor />}
          </div>
        </div>
      )}

      {/* 3. PUBLIC SERVICES */}
      <h2 className={styles.sectionTitle}>Core Services</h2>
      <div className={styles.grid}>
        
        {/* Events */}
        <DashboardCard 
          title="City Events" 
          desc="Festivals, Summits & Workshops"
          link="/events"
          color="#3b82f6" /* Blue */
          delay="0.1s"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          } 
        />

        {/* Facilities */}
        <DashboardCard 
          title="Facilities" 
          desc="Book Gyms, Halls & Courts"
          link="/facilities"
          color="#8b5cf6" /* Violet */
          delay="0.2s"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18M5 21V7l8-4 8 4v14M17 21v-8.5a1.5 1.5 0 0 0-1.5-1.5h-5a1.5 1.5 0 0 0-1.5 1.5V21" />
            </svg>
          }
        />

        {/* Parking */}
        <DashboardCard 
          title="Smart Parking" 
          desc="Real-time Availability"
          link="/parking"
          color="#10b981" /* Emerald */
          delay="0.3s"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M9 14v-4h3a2 2 0 0 1 0 4h-3" />
            </svg>
          }
        />
      </div>

      {/* 4. ADMIN ZONE (Conditional) */}
      {user && user.is_staff && (
        <>
          <h2 className={styles.sectionTitle}>Administration</h2>
          <div className={styles.grid}>
            
            <DashboardCard 
              title="Create Resource" 
              desc="Publish Events & Updates"
              link="/admin/create"
              color="#f59e0b"
              delay="0.4s"
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>}
            />

            <DashboardCard 
              title="Live Monitor" 
              desc="System Operations View"
              link="/admin/live"
              color="#ef4444"
              delay="0.5s"
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>}
            />

            <DashboardCard 
              title="Data Analytics" 
              desc="Financial & Usage Reports"
              link="/admin/analytics"
              color="#3b82f6"
              delay="0.6s"
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>}
            />

            <DashboardCard 
              title="Access Scanner" 
              desc="QR Code Entry"
              link="/admin/scan"
              color="#ec4899"
              delay="0.7s"
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect x="7" y="7" width="10" height="10" rx="1" /></svg>}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;