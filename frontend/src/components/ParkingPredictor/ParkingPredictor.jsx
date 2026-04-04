/* src/components/ParkingPredictor/ParkingPredictor.jsx */
import React, { useState } from 'react';
import api from '../../services/api';
import styles from './ParkingPredictor.module.css';

// --- SVG ICONS ---
const CarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 21h5v-5" />
  </svg>
);

const ParkingPredictor = () => {
  const [datetime, setDatetime] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // --- NEW: Feedback State ---
  const [feedbackStatus, setFeedbackStatus] = useState(null); // 'submitting', 'success', 'error'

  const handlePredict = async () => {
    if (!datetime) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/transport/predict/', { datetime: datetime });
      setPrediction(res.data);
    } catch (err) {
      console.error("Prediction failed", err);
      setError("Unable to connect to AI Engine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrediction(null);
    setDatetime('');
    setFeedbackStatus(null); // Reset feedback when checking a new time
  };

  // --- NEW: Feedback API Call ---
  const handleFeedback = async (isAccurate) => {
    setFeedbackStatus('submitting');
    try {
      // Sends true for 👍 and false for 👎
      await api.post('/transport/feedback/', { 
        is_accurate: isAccurate, 
        forecast_datetime: datetime 
      });
      setFeedbackStatus('success');
    } catch (err) {
      console.error("Feedback failed", err);
      setFeedbackStatus('error'); // Fails silently for the user but logs it
    }
  };

  const getLevelClass = (level) => {
    switch(level?.toLowerCase()) {
      case 'critical': return styles.critical;
      case 'high': return styles.high;
      case 'moderate': return styles.moderate;
      default: return styles.low;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon}><CarIcon /></span>
        <div>
          <h3 className={styles.title}>Smart Traffic Forecast</h3>
          {!prediction && <span className={styles.subtitle}>AI-Powered Prediction</span>}
        </div>
      </div>

      {/* INPUT FORM */}
      {!prediction && (
        <div className={styles.formContainer}>
          <label className={styles.label}>Select Time</label>
          <div className={styles.inputGroup}>
            <input 
              type="datetime-local" 
              className={styles.input}
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
            />
            <button 
              className={styles.button}
              onClick={handlePredict}
              disabled={loading || !datetime}
            >
              {loading ? '...' : 'Check'}
            </button>
          </div>
          {error && <div className="text-red-400 text-xs text-center mt-2">{error}</div>}
        </div>
      )}

      {/* RESULT VIEW */}
      {prediction && (
        <div className={`${styles.result} ${getLevelClass(prediction.level)}`}>
          
          <div className={styles.resultHeader}>
            <div className={styles.levelTag}>{prediction.level} Demand</div>
            <button onClick={handleReset} className={styles.resetBtn} title="Check another time">
              <RefreshIcon />
            </button>
          </div>
          
          <div className={styles.flexRow}>
            <div className={styles.percentage}>
              {prediction.predicted_occupancy}%
            </div>
            <div className={styles.context}>
              <strong className="text-white block">{prediction.day} @ {prediction.hour}:00</strong>
              {prediction.is_weekend ? <span className="text-yellow-400 text-xs">Weekend Traffic</span> : <span className="opacity-50 text-xs">Weekday</span>}
            </div>
          </div>

          <div className={styles.meterBg}>
            <div 
              className={styles.meterFill} 
              style={{ width: `${prediction.predicted_occupancy}%` }}
            />
          </div>

          {/* --- NEW: AI FEEDBACK LOOP --- */}
          <div className={styles.feedbackSection}>
            {feedbackStatus === 'success' ? (
              <span className={styles.feedbackSuccess}>✨ Thanks for making our AI smarter!</span>
            ) : (
              <>
                <span className={styles.feedbackText}>Was this accurate?</span>
                <button 
                  onClick={() => handleFeedback(true)} 
                  className={styles.thumbBtn}
                  disabled={feedbackStatus === 'submitting'}
                >
                  👍
                </button>
                <button 
                  onClick={() => handleFeedback(false)} 
                  className={styles.thumbBtn}
                  disabled={feedbackStatus === 'submitting'}
                >
                  👎
                </button>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default ParkingPredictor;