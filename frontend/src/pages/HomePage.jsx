import React from 'react';
import useAuth from '../hooks/useAuth';
import DashboardCard from '../components/DashboardCard/DashboardCard';
import styles from './HomePage.module.css';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      {/* 1. WELCOME SECTION */}
      <div className={styles.hero}>
        <h1 className={styles.greeting}>
          WELCOME, <span className={styles.username}>{user ? user.email.split('@')[0] : 'CITIZEN'}</span>
        </h1>
        <p className={styles.subtitle}>Smart City Operations & Access Hub</p>
      </div>

      {/* 2. MAIN SERVICES GRID (User) */}
      <h2 className={styles.sectionTitle}>CITY SERVICES</h2>
      <div className={styles.grid}>
        
        {/* EVENTS CARD */}
        <DashboardCard 
          title="EVENTS" 
          desc="Browse & Book City Events"
          link="/events"
          color="#00FFE0" // Cyan
          delay="0.1s"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <path d="M8 14h.01"></path>
              <path d="M12 14h.01"></path>
              <path d="M16 14h.01"></path>
              <path d="M8 18h.01"></path>
              <path d="M12 18h.01"></path>
              <path d="M16 18h.01"></path>
              <path d="M16 2v4"></path>
              <path d="M8 2v4"></path>
              <circle cx="18" cy="18" r="4" stroke="currentColor" fill="none" />
              <path d="M20.5 20.5L22 22" />
            </svg>
          } 
        />

        {/* FACILITIES CARD */}
        <DashboardCard 
          title="FACILITIES" 
          desc="Reserve Gyms, Courts & Halls"
          link="/facilities"
          color="#00FFE0"
          delay="0.2s"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" />
              <path d="M5 21V7l8-4 8 4v14" />
              <path d="M17 21v-8.5a1.5 1.5 0 0 0-1.5-1.5h-5a1.5 1.5 0 0 0-1.5 1.5V21" />
              <path d="M9 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
              <path d="M9 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
              <path d="M15 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
              <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
              <line x1="13" y1="3" x2="13" y2="1" />
              <circle cx="13" cy="1" r="1" />
            </svg>
          }
        />

        {/* PARKING CARD */}
        <DashboardCard 
          title="SMART PARKING" 
          desc="Live Capacity & Booking"
          link="/parking"
          color="#00FFE0"
          delay="0.3s"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
              <path d="M9 16v-4h4a2 2 0 0 1 0 4h-4" /> {/* P symbol */}
              <path d="M16 2v4" />
              <path d="M17 3.5a3 3 0 0 1 3 3" /> {/* Signal waves */}
              <path d="M19 2.5a5 5 0 0 1 3 3" />
            </svg>
          }
        />
      </div>

      {/* 3. ADMIN ZONE (Conditional) */}
      {user && user.is_staff && (
        <>
          <h2 className={styles.sectionTitle} style={{marginTop: '3rem'}}>COMMAND CENTER</h2>
          <div className={styles.grid}>
            
            {/* CREATE RESOURCE */}
            <DashboardCard 
              title="CREATE RESOURCE" 
              desc="Add Events, Locations, Parking"
              link="/admin/create"
              color="#9B5CFF" // Purple
              delay="0.4s"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M12 8v8" />
                  <path d="M8 12h8" />
                </svg>
              }
            />

            {/* LIVE MONITOR */}
            <DashboardCard 
              title="LIVE MONITOR" 
              desc="Real-time Operations View"
              link="/admin/live"
              color="#9B5CFF"
              delay="0.5s"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                  <polyline points="22,6 12,13 2,6"></polyline> {/* Abstract screen line */}
                  <polyline points="4 9 9 14 15 8 20 12" /> {/* EKG/Pulse Line */}
                </svg>
              }
            />

            {/* ANALYTICS */}
            <DashboardCard 
              title="ANALYTICS" 
              desc="Data Insights & Reports"
              link="/admin/analytics"
              color="#9B5CFF"
              delay="0.6s"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="M18 17V9" />
                  <path d="M13 17V5" />
                  <path d="M8 17v-3" />
                  <path d="M21 5l-6 4-4-6-6 5" strokeOpacity="0.6" strokeWidth="1" strokeDasharray="4 2"/>
                </svg>
              }
            />

            {/* QR SCANNER */}
            <DashboardCard 
              title="QR SCANNER" 
              desc="Check-in & Verification"
              link="/admin/scan"
              color="#FF2E63" // Red
              delay="0.7s"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <rect x="7" y="7" width="10" height="10" rx="1" />
                  <line x1="2" y1="12" x2="22" y2="12" style={{opacity: 0.5}} strokeDasharray="4 2"/>
                </svg>
              }
            />
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;