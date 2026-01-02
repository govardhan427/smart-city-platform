import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import styles from './Navbar.module.css';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.info("Logged out. See you soon!");
    navigate('/login');
  };

  // Helper to highlight the active link
  const isActive = (path) => location.pathname === path ? styles.active : '';
  const isDockActive = (path) => location.pathname === path ? styles.activeDockItem : '';

  return (
    <>
      {/* =======================================
          TOP NAVBAR (Desktop Design)
         ======================================= */}
      <nav className={styles.navbar}>
        
        {/* --- BRANDING --- */}
        <Link to="/" className={styles.logo}>
          <>
  <style>
    {`
      @keyframes backPulse {
        0% {
          transform: scale(0.8);
          opacity: 0.6;
        }
        100% {
          transform: scale(3);
          opacity: 0;
        }
      }
    `}
  </style>

  <div
    style={{
      width: '24px',
      height: '24px',
      position: 'relative',
      display: 'grid',
      placeItems: 'center'
    }}
  >
    {/* BACKSIDE PULSE */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        filter: 'blur(6px)',
        transformOrigin: 'center',
        animation: 'backPulse 1.6s ease-out infinite',
        zIndex: 0
      }}
    />

    {/* MAIN BOX */}
    <div
      style={{
        width: '24px',
        height: '24px',
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        borderRadius: '6px',
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 0 10px rgba(59,130,246,0.5)',
        position: 'relative',
        zIndex: 2
      }}
    >
      {/* CENTER DOT */}
      <div
        style={{
          width: '8px',
          height: '8px',
          background: 'white',
          borderRadius: '50%'
        }}
      />
    </div>
  </div>
</>

          Smart Access Hub <span style={{opacity: 0.6, fontWeight: 400}}>OS</span>
        </Link>

        {/* --- DESKTOP LINKS (Hidden on Mobile) --- */}
        <div className={styles.navLinks}>
          <Link to="/" className={`${styles.link} ${isActive('/')}`}>Home</Link>

          {user ? (
            <>
              <Link to="/my-bookings" className={`${styles.link} ${isActive('/my-bookings')}`}>My Bookings</Link>
              
              {user.is_staff && (
                <>
                  <Link to="/admin/scan" className={`${styles.link} ${isActive('/admin/scan')}`}>Scanner</Link>
                  <Link to="/admin/analytics" className={`${styles.link} ${isActive('/admin/analytics')}`}>Analytics</Link>
                </>
              )}

              <Link to="/profile" className={`${styles.link} ${isActive('/profile')}`}>Profile</Link>

              <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.link}>Login</Link>
              <Link to="/register" className={styles.signUpBtn}>Sign Up</Link>
            </>
          )}
        </div>

        {/* --- MOBILE ONLY: Top Right Logout/Login --- */}
        <div className={styles.mobileTopActions}>
            {user ? (
                <button onClick={handleLogout} className={styles.logoutBtnSmall}>Logout</button>
            ) : (
                <Link to="/login" className={styles.link}>Login</Link>
            )}
        </div>
      </nav>

      {/* =======================================
          MOBILE BOTTOM DOCK (Updated Links)
         ======================================= */}
      <div className={styles.bottomDock}>
        
        {/* 1. HOME */}
        <Link to="/" className={`${styles.dockItem} ${isDockActive('/')}`}>
          <svg className={styles.dockIcon} viewBox="0 0 24 24">
             <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className={styles.dockLabel}>Home</span>
        </Link>

        {/* 2. MY BOOKINGS (Replaced Events/Parking) */}
        {user && (
            <Link to="/my-bookings" className={`${styles.dockItem} ${isDockActive('/my-bookings')}`}>
            <svg className={styles.dockIcon} viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 002 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
            <span className={styles.dockLabel}>Bookings</span>
            </Link>
        )}

        {/* 3. PROFILE */}
        {user ? (
            <Link to="/profile" className={`${styles.dockItem} ${isDockActive('/profile')}`}>
            <svg className={styles.dockIcon} viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span className={styles.dockLabel}>Profile</span>
            </Link>
        ) : (
            // If NOT logged in, show Login link in dock instead of Profile
            <Link to="/login" className={`${styles.dockItem} ${isDockActive('/login')}`}>
            <svg className={styles.dockIcon} viewBox="0 0 24 24">
                <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
            </svg>
            <span className={styles.dockLabel}>Login</span>
            </Link>
        )}

      </div>
    </>
  );
};

export default Navbar;