import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import styles from './Navbar.module.css';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info("Logged out. See you soon!");
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        
        {/* --- BRANDING WITH NEON SVG --- */}
        <Link to="/" className={styles.navBrand}>
          <svg 
            className={styles.logoSvg} 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M50 5 L90 25 V75 L50 95 L10 75 V25 Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeOpacity="0.5"
            />
            <path 
              d="M70 30 H40 C35 30 30 35 30 40 V45 C30 50 35 55 40 55 H60 C65 55 70 60 70 65 V70 C70 75 65 80 60 80 H30" 
              stroke="currentColor" 
              strokeWidth="6" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <circle cx="70" cy="30" r="4" fill="currentColor" />
            <circle cx="30" cy="80" r="4" fill="currentColor" />
          </svg>
          
            Smart Access Hub for Urban Mobility
        </Link>

        {/* --- NAVIGATION LINKS --- */}
        <ul className={styles.navbarNav}>
          
          {/* Public Link */}
          <li className={styles.navItem}>
            <Link to="/" className={styles.navLink}>Home</Link>
          </li>

          {user ? (
            // --- LOGGED IN LINKS ---
            <>
              {/* Core Services (Quick Access) */}
              {/* <li className={styles.navItem}>
                <Link to="/facilities" className={styles.navLink}>Facilities</Link>
              </li>
              <li className={styles.navItem}>
                <Link to="/parking" className={styles.navLink}>Parking</Link>
              </li> */}
              
              <li className={styles.navItem}>
                <Link to="/my-bookings" className={styles.navLink}>My Bookings</Link>
              </li>

              {/* Admin Only Links */}
              {user.is_staff && (
                <>
                  {/* <li className={styles.navItem}>
                    <Link to="/admin/create" className={styles.navLink}>Create</Link>
                  </li>
                  <li className={styles.navItem}>
                    <Link to="/admin/analytics" className={styles.navLinkAdmin}>Analytics</Link>
                  </li> */}
                  <li className={styles.navItem}>
                    <Link to="/admin/scan" className={styles.navLinkAdmin}>Scan</Link>
                  </li>
                </>
              )}

              {/* Profile (Available to EVERYONE) */}
              <li className={styles.navItem}>
                <Link to="/profile" className={styles.navLink}>Profile</Link>
              </li>

              {/* Logout */}
              <li className={styles.navItem}>
                <button onClick={handleLogout} className={styles.navButton}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            // --- LOGGED OUT LINKS ---
            <>
              <li className={styles.navItem}>
                <Link to="/login" className={styles.navLink}>Login</Link>
              </li>
              <li className={styles.navItem}>
                <Link to="/register" className={styles.navLink}>Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;