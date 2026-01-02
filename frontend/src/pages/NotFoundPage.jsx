import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      height: '70vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      color: 'white',
    },
    errorCode: {
      fontSize: '8rem',
      fontWeight: '800',
      color: '#ef4444', // Red
      lineHeight: '1',
      textShadow: '0 0 30px rgba(239, 68, 68, 0.5)',
      fontFamily: "'Orbitron', sans-serif",
    },
    message: {
      fontSize: '1.5rem',
      marginBottom: '2rem',
      color: 'rgba(255, 255, 255, 0.7)',
    },
    glitch: {
        animation: 'glitch 1s infinite'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.errorCode}>404</h1>
      <h2 style={styles.message}>SECTOR NOT FOUND</h2>
      <p style={{maxWidth: '400px', marginBottom: '30px', color: '#888'}}>
        The coordinate you are trying to access does not exist within the CityOS grid.
      </p>
      
      <Button variant="primary" onClick={() => navigate('/')}>
        Return to Base
      </Button>
    </div>
  );
};

export default NotFoundPage;