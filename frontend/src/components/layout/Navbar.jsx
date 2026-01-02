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

  return (
    <nav className={styles.navbar}>
      
      {/* --- BRANDING (Gradient Text) --- */}
      <Link to="/" className={styles.logo}>
        {/* Simple futuristic icon */}
        <div style={{
          width: '24px', 
          height: '24px', 
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
          borderRadius: '6px',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
        }}>
          <div style={{width: '8px', height: '8px', background: 'white', borderRadius: '50%'}}></div>
        </div>
        SmartCity<span style={{opacity: 0.6, fontWeight: 400}}>OS</span>
      </Link>

      {/* --- NAVIGATION LINKS --- */}
      <div className={styles.navLinks}>
        
        <Link to="/" className={`${styles.link} ${isActive('/')}`}>Home</Link>

        {user ? (
          <>
            {/* Core User Links */}
            <Link to="/my-bookings" className={`${styles.link} ${isActive('/my-bookings')}`}>My Bookings</Link>
            
            {/* Admin Links */}
            {user.is_staff && (
              <>
                <Link to="/admin/scan" className={`${styles.link} ${isActive('/admin/scan')}`}>Scanner</Link>
                <Link to="/admin/analytics" className={`${styles.link} ${isActive('/admin/analytics')}`}>Analytics</Link>
              </>
            )}

            {/* Profile */}
            <Link to="/profile" className={`${styles.link} ${isActive('/profile')}`}>Profile</Link>

            {/* Logout Button */}
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          /* Logged Out State */
          <>
            <Link to="/login" className={styles.link}>Login</Link>
            <Link 
              to="/register" 
              style={{
                background: 'white', 
                color: 'black', 
                padding: '8px 20px', 
                borderRadius: '50px', 
                textDecoration: 'none', 
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;