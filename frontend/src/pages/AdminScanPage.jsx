/* src/pages/AdminScanPage.jsx */
import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../services/api';
import styles from './AdminScanPage.module.css';

const AdminScanPage = () => {
  const [loading, setLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState(null); // 'success', 'error', 'warning'
  const [message, setMessage] = useState('');
  
  // --- NEW: State for manual ID entry ---
  const [manualId, setManualId] = useState('');
  
  // Key to force re-render/reset of scanner
  const [scannerKey, setScannerKey] = useState(0); 
  const scannerRef = useRef(null);

  useEffect(() => {
    // 1. Prevent duplicate initialization
    if (scannerRef.current) return;

    // 2. Clear previous instance from DOM if exists
    const container = document.getElementById("qr-reader-container");
    if (container) container.innerHTML = "";

    // 3. Init Scanner
    const qrScanner = new Html5QrcodeScanner(
      "qr-reader-container",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        facingMode: "environment",
        aspectRatio: 1.0 
      },
      false
    );

    scannerRef.current = qrScanner;

    const onScanSuccess = (decodedText) => {
      // Pause scanner immediately
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
      handleCheckIn(decodedText);
    };

    qrScanner.render(onScanSuccess, (err) => { 
        // Ignore minor scan errors (noisy frames)
    });

    // 4. Cleanup on unmount or re-key
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(err => console.warn("Scanner clear error", err));
        } catch (e) {
          console.warn("Scanner cleanup error", e);
        }
        scannerRef.current = null;
      }
    };
  }, [scannerKey]);

  const handleCheckIn = async (qrData) => {
    if (!qrData.trim()) return; // Prevent empty submissions
    
    setLoading(true);
    setScanStatus(null);
    setMessage('');

    try {
      // The backend doesn't care if qrData came from the camera or the keyboard!
      const response = await api.post('/events/check-in/', {
        registration_id: qrData.trim(),
      });
      
      setScanStatus('success');
      setMessage(response.data.message || 'Access Granted: Welcome!');
      setManualId(''); // Clear input on success

    } catch (err) {
      console.error(err);
      const errorResponse = err.response?.data;
      const errorMsg = errorResponse?.error || errorResponse?.detail || 'Scan failed. Invalid ID.';
      
      // Check for "Duplicate" or "Already Checked In"
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

  // --- NEW: Handler for manual form submission ---
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error); // Stop camera if typing manually
    }
    handleCheckIn(manualId);
  };

  const handleScanNext = () => {
    setScanStatus(null);
    setMessage('');
    setManualId('');
    setScannerKey(prev => prev + 1); // Triggers re-mount of scanner
  };

  return (
    <div className={styles.scanContainer}>
      <h1 className={styles.title}>Access Scanner</h1>
      <p className={styles.subtitle}>Align ticket QR code within the frame, or enter ID manually.</p>

      {/* --- CAMERA FEED --- */}
      <div 
        className={styles.scannerWrapper} 
        style={{ display: scanStatus ? 'none' : 'block' }} 
      >
        <div id="qr-reader-container"></div>
      </div>
      
      {/* --- NEW: MANUAL ENTRY FALLBACK --- */}
      {!scanStatus && !loading && (
        <form onSubmit={handleManualSubmit} className={styles.manualEntryForm}>
            <input 
              type="text" 
              placeholder="Or enter Access ID manually..." 
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              className={styles.manualInput}
              autoFocus
            />
            <button 
              type="submit" 
              disabled={!manualId.trim()}
              className={styles.manualBtn}
            >
              Verify
            </button>
        </form>
      )}

      {/* --- RESULT FEEDBACK --- */}
      <div className={styles.feedbackContainer}>
        
        {loading && (
          <div className={styles.feedbackLoading} style={{ textAlign: 'center', marginTop: '20px', color: '#60a5fa' }}>
              Verifying ID...
          </div>
        )}

        {!loading && scanStatus === 'success' && (
          <div className={styles.feedbackSuccess}>
            {message}
          </div>
        )}

        {!loading && scanStatus === 'warning' && (
          <div className={styles.feedbackWarning}>
            {message}
            <div className={styles.timestamp}>Duplicate Entry Attempt</div>
          </div>
        )}

        {!loading && scanStatus === 'error' && (
          <div className={styles.feedbackError}>
            {message}
          </div>
        )}
      </div>
      
      {/* --- RESET BUTTON --- */}
      {(scanStatus) && (
        <button className={styles.nextBtn} onClick={handleScanNext} style={{ marginTop: '20px' }}>
          Scan Next Ticket
        </button>
      )}
    </div>
  );
};

export default AdminScanPage;