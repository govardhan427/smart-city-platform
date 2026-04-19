/* src/pages/HomePage.jsx */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import DashboardCard from '../components/DashboardCard/DashboardCard';
import RecommendationSection from '../components/RecommendationSection/RecommendationSection';
import ParkingPredictor from '../components/ParkingPredictor/ParkingPredictor';
import styles from './HomePage.module.css';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeFeature, setActiveFeature] = useState(null); 

  const getDisplayName = () => {
    if (!user) return 'CITIZEN';
    if (user.username && user.username.length > 0) return user.username;
    if (user.email) return user.email.split('@')[0];
    return 'CITIZEN';
  };

  const toggleFeature = (feature) => {
    setActiveFeature(prev => prev === feature ? null : feature);
  };

  return (
    <>
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
              <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg></span> For You
            </button>
            <button 
              className={`${styles.toggleBtn} ${activeFeature === 'predict' ? styles.activeBtn : ''}`}
              onClick={() => toggleFeature('predict')}
            >
              <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="7" y="2" width="10" height="20" rx="3" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="7" r="1.6" fill="currentColor" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /><circle cx="12" cy="17" r="1.6" fill="currentColor" /></svg></span> Traffic Forecast
            </button>
          </div>

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
          color="#3b82f6" 
          delay="0.1s"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>} 
        />

        {/* Facilities */}
        <DashboardCard 
          title="Facilities" 
          desc="Book Gyms, Halls & Courts"
          link="/facilities"
          color="#8b5cf6" 
          delay="0.2s"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l8-4 8 4v14M17 21v-8.5a1.5 1.5 0 0 0-1.5-1.5h-5a1.5 1.5 0 0 0-1.5 1.5V21" /></svg>}
        />

        {/* Parking */}
        <DashboardCard 
          title="Smart Parking" 
          desc="Real-time Availability"
          link="/parking"
          color="#10b981" 
          delay="0.3s"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M9 14v-4h3a2 2 0 0 1 0 4h-3" /></svg>}
        />
      </div>

      {/* --- MOVED: CITY COMMAND CENTER TEASER BANNER --- */}
      <div className={styles.mapTeaser} onClick={() => navigate('/map')}>
        <div className={styles.mapTeaserBg}></div>
        <div className={styles.mapTeaserContent}>
          
          {/* CUSTOM SVG ICON INJECTED HERE */}
          <div className={styles.mapTeaserIcon}>
            <svg width="60" height="60" viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M255.998,226.953c41.753,0,75.724-33.974,75.724-75.736c0-41.753-33.97-75.724-75.724-75.724 c-41.753,0-75.722,33.969-75.722,75.724C180.276,192.977,214.246,226.953,255.998,226.953z M255.998,117.925 c18.357,0,33.293,14.934,33.293,33.291c0,18.364-14.936,33.305-33.293,33.305s-33.291-14.941-33.291-33.305 C222.707,132.86,237.642,117.925,255.998,117.925z"/>
              <path d="M473.053,194.757c0-11.717-9.499-21.215-21.216-21.215h-47.831C419.387,77.012,344.64,0,255.998,0 c-87.981,0-163.53,76.35-148.012,173.541H60.161c-11.717,0-21.216,9.499-21.216,21.215v296.028 c0,11.717,9.499,21.215,21.216,21.215h391.679h0.001h0.001c11.388,0,21.213-9.236,21.213-21.215 C473.053,477.597,473.053,207.852,473.053,194.757z M392.033,216.16c0.009-0.023,0.017-0.045,0.026-0.068 c0.014-0.04,0.031-0.081,0.045-0.12h38.517v105.341h-87.384C360.19,289.228,379.323,250.328,392.033,216.16z M255.998,42.431 c67.658,0,127.976,63.229,100.911,145.712c-19.504,59.443-68.939,147.93-100.911,201.766 c-31.877-53.684-81.409-142.34-100.911-201.766C127.96,105.455,188.5,42.431,255.998,42.431z M159.361,469.569H81.376V215.972 h38.519c6.24,17.162,18.992,47.189,39.466,87.262V469.569z M201.792,469.569v-88.371c20.309,35.423,36.022,60.593,36.219,60.905 c8.304,13.275,27.675,13.267,35.973,0c0.202-0.323,16.963-27.167,38.242-64.437l89.384,91.903H201.792z M430.624,438.541 l-72.749-74.797h72.749V438.541z"/>
            </svg>
          </div>

          <div className={styles.mapTeaserText}>
            <h2>Access City Command Center</h2>
            <p>View live traffic, active events, and infrastructure on the interactive 3D map.</p>
          </div>
        </div>
        <div className={styles.mapTeaserAction}>
          Launch Map <span className={styles.arrow}>&rarr;</span>
        </div>
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
<div className={styles.terminalSignOff}>
        
        {/* Left Side: Name and Role */}
        <div className={styles.creatorInfo}>
          <div className={styles.terminalHeader}>
            <span className={styles.terminalBlink}>_</span>This Project Build BY
          </div>
          <h3 className={styles.creatorName}>Govardhan</h3>
          <p className={styles.creatorRole}>Full-Stack + DevOps Engineer</p> 
        </div>

        {/* Right Side: Social Links */}
        <div className={styles.socialLinks}>
          <a 
            href="https://govardhan-portflio.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.socialPill}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            Portfolio
          </a>
          
          <a 
            href="https://linkedin.com/in/govardhan427" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.socialPill}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            LinkedIn
          </a>

          <a 
            href="https://instagram.com/govardhan_427" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.socialPill}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            Instagram
          </a>
        </div>
      </div>
    </>
  );
};

export default HomePage;