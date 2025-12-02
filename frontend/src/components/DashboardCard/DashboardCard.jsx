import React from 'react';
import { Link } from 'react-router-dom';
import styles from './DashboardCard.module.css';

const DashboardCard = ({ title, desc, icon, link, color, delay }) => {
  // 'color' prop allows us to switch between Cyan (User) and Purple (Admin)
  
  return (
    <Link 
      to={link} 
      className={styles.card} 
      style={{ 
        '--accent-color': color || 'var(--primary-neon)',
        animationDelay: delay || '0s' 
      }}
    >
      <div className={styles.iconWrapper}>
        {icon}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.desc}>{desc}</p>
      </div>
      <div className={styles.glow}></div>
    </Link>
  );
};

export default DashboardCard;