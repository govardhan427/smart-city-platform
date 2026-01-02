import React from 'react';
import { Link } from 'react-router-dom';
import styles from './DashboardCard.module.css';

const DashboardCard = ({ title, desc, icon, link, color, delay }) => {
  // 'color' acts as the Ambient Light source in this theme
  
  return (
    <Link 
      to={link} 
      className={styles.card} 
      style={{ 
        '--accent-color': color || '#3b82f6', // Default to Blue if no color provided
        animationDelay: delay || '0s',
        // Start slightly down for the "Fade Up" animation
        transform: 'translateY(20px)' 
      }}
    >
      {/* Icon floats on top */}
      <div className={styles.iconWrapper}>
        {icon}
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.desc}>{desc}</p>
      </div>
      
      {/* The invisible light source that glows on hover */}
      <div className={styles.glow}></div>
    </Link>
  );
};

export default DashboardCard;