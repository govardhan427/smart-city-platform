import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../services/api';
import styles from './AdminScanPage.module.css';

const AdminScanPage = () => {
  const [loading, setLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState(null); // 'success', 'error', 'warning'
  const [message, setMessage] = useState('');
  
  // This key forces the useEffect to re-run when we want to restart the scanner
  const [scannerKey, setScannerKey] = useState(0); 
  
  const scannerRef = useRef(null);

  useEffect(() => {
    // 1. CLEANUP PREVIOUS SCANNERS (Crucial for preventing duplicates)
    // If the scanner already exists in the ref, don't create another one.
    if (scannerRef.current) {
        return;
    }

    // Double safety: Clear the DOM container
    const container = document.getElementById("qr-reader-container");
    if (container) container.innerHTML = "";

    // 2. Initialize Scanner
    const qrScanner = new Html5QrcodeScanner(
      "qr-reader-container",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        facingMode: "environment" 
      },
      false
    );

    scannerRef.current = qrScanner;

    const onScanSuccess = (decodedText) => {
      // Pause/Clear scanning immediately to prevent multiple hits
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
      handleCheckIn(decodedText);
    };

    qrScanner.render(onScanSuccess, (err) => {});

    // 3. CLEANUP FUNCTION
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch((err) => {
            console.warn("Failed to clear scanner on unmount", err);
          });
        } catch (e) {
          console.warn("Scanner cleanup error", e);
        }
        scannerRef.current = null;
      }
    };
  }, [scannerKey]); // Re-run when scannerKey changes

  const handleCheckIn = async (qrData) => {
    setLoading(true);
    setScanStatus(null);
    setMessage('');

    try {
      const response = await api.post('/events/check-in/', {
        registration_id: qrData,
      });
      
      setScanStatus('success');
      setMessage(response.data.message || 'Check-in successful!');

    } catch (err) {
      console.error(err);
      const errorResponse = err.response?.data;
      const errorMsg = errorResponse?.error || errorResponse?.detail || 'Scan failed';
      
      // 4. CHECK FOR "ALREADY CHECKED IN" (Case-insensitive)
      if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('duplicate')) {
        setScanStatus('warning');
        setMessage(`⚠️ ${errorMsg}`);
      } else {
        setScanStatus('error');
        setMessage(`❌ ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to restart without reloading the page
  const handleScanNext = () => {
    setScanStatus(null);
    setMessage('');
    // Increment key -> Triggers useEffect cleanup -> Triggers useEffect start
    setScannerKey(prev => prev + 1); 
  };

  return (
    <div className={styles.scanContainer}>
      <h1 className={styles.title}>QR Check-In</h1>
      <p className={styles.subtitle}>Scan user ticket for entry</p>

      {/* Camera Container */}
      <div 
        className={styles.scannerWrapper} 
        style={{ display: scanStatus ? 'none' : 'block' }} 
      >
        <div id="qr-reader-container"></div>
      </div>
      
      {/* Feedback Messages */}
      <div className={styles.feedbackContainer}>
        {loading && (
          <div className={styles.feedbackLoading}>Processing...</div>
        )}

        {!loading && scanStatus === 'success' && (
          <div className={styles.feedbackSuccess}>
            ✅ {message}
          </div>
        )}

        {!loading && scanStatus === 'warning' && (
          <div className={styles.feedbackWarning}>
            {message}
            <div className={styles.timestamp}>Recorded previously</div>
          </div>
        )}

        {!loading && scanStatus === 'error' && (
          <div className={styles.feedbackError}>
            {message}
          </div>
        )}
      </div>
      
      {/* Scan Next Button */}
      {(scanStatus) && (
        <button className={styles.nextBtn} onClick={handleScanNext}>
          Scan Next Person
        </button>
      )}
    </div>
  );
};

export default AdminScanPage;