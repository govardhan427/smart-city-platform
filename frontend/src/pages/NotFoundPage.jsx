/* src/pages/NotFoundPage.jsx */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      height: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px'
    }}>
      {/* MASSIVE AMBIENT BACKGROUND TEXT */}
      <div style={{
        position: 'absolute',
        fontSize: 'clamp(150px, 30vw, 400px)',
        fontWeight: '900',
        color: 'rgba(59, 130, 246, 0.03)', // Barely visible blue
        zIndex: 0,
        userSelect: 'none',
        letterSpacing: '-0.05em',
        pointerEvents: 'none'
      }}>
        404
      </div>

      {/* MODERN FROSTED GLASS CARD */}
      <div style={{
        zIndex: 1,
        background: 'rgba(24, 24, 27, 0.5)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)', // Safari support
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '50px 40px',
        maxWidth: '450px',
        textAlign: 'center',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* GLOWING WARNING ICON */}
        <div style={{
          width: '72px',
          height: '72px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#ffffff',
          margin: '0 0 12px 0',
          letterSpacing: '-0.5px'
        }}>
          Lost in the Grid?
        </h2>

        {/* THE CHEEKY SENTENCE */}
        <p style={{
          fontSize: '1.05rem',
          color: '#a1a1aa',
          lineHeight: '1.6',
          marginBottom: '35px'
        }}>
          We checked the sensors, scanned the satellites, and interrogated the AI mainframe. Looks like you've wandered completely off the map (or you just made up that URL).
        </p>

        {/* YOUR REUSABLE BUTTON */}
        <div style={{ width: '100%' }}>
          <Button 
            variant="primary" 
            onClick={() => navigate('/')} 
            style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
          >
            Reroute to Command Center
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;