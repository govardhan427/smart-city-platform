/* src/components/ParkingPredictor/ParkingPredictor.jsx */
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import styles from './ParkingPredictor.module.css';

// --- SVG ICONS ---
const CarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const CpuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

const ParkingPredictor = () => {
  const [datetime, setDatetime] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState(null); 

  // --- NEW: Cold Start States ---
  const [loading, setLoading] = useState(false);
  const [isColdStart, setIsColdStart] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // --- Smart Quick-Select Time Helpers ---
  const handleQuickSelect = (type) => {
    const now = new Date();
    if (type === 'hour') now.setHours(now.getHours() + 1);
    if (type === 'tonight') now.setHours(20, 0, 0, 0); 
    if (type === 'tomorrow') {
      now.setDate(now.getDate() + 1);
      now.setHours(9, 0, 0, 0); 
    }

    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now - offset)).toISOString().slice(0, 16);
    
    setDatetime(localISOTime);
    setError('');
  };

  // Memoized fetch function for initial click and automatic retries
  const executePrediction = useCallback(async (timeToPredict) => {
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/transport/predict/', { datetime: timeToPredict });
      setPrediction(res.data);
      setIsColdStart(false); 
      setLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 503) {
        setIsColdStart(true);
        setCountdown(30);
      } else {
        console.error("Prediction failed", err);
        setError("Unable to connect to AI Engine. Please try again.");
        setIsColdStart(false);
        setLoading(false);
      }
    }
  }, []);

  const handlePredict = () => {
    if (!datetime) {
      setError("Please select a time first.");
      return;
    }
    executePrediction(datetime);
  };

  // --- Countdown Timer Logic ---
  useEffect(() => {
    let timer;
    if (isColdStart && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isColdStart && countdown === 0) {
      // Time is up! Auto-retry the prediction
      setIsColdStart(false);
      executePrediction(datetime);
    }
    return () => clearInterval(timer);
  }, [isColdStart, countdown, datetime, executePrediction]);

  const handleReset = () => {
    setPrediction(null);
    setDatetime('');
    setFeedbackStatus(null); 
    setError('');
    setIsColdStart(false);
    setCountdown(0);
  };

  const handleFeedback = async (isAccurate) => {
    setFeedbackStatus('submitting');
    try {
      await api.post('/transport/feedback/', { 
        is_accurate: isAccurate, 
        forecast_datetime: datetime 
      });
      setFeedbackStatus('success');
    } catch (err) {
      console.error("Feedback failed", err);
      setFeedbackStatus('error'); 
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
      
      {/* HEADER */}
      <div className={styles.header}>
        <span className={styles.icon}><CarIcon /></span>
        <div className={styles.headerText}>
          <h3 className={styles.title}>Traffic Forecast</h3>
          <span className={styles.subtitle}>ML Predictive Engine</span>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && !loading && !isColdStart && <div className={styles.errorBanner}>{error}</div>}

      {/* INPUT FORM */}
      {!prediction && !loading && !isColdStart && (
        <div className={styles.formContainer}>
          <label className={styles.label}>Quick Select</label>
          <div className={styles.quickSelectGrid}>
            <button className={styles.quickPill} onClick={() => handleQuickSelect('hour')}>+1 Hour</button>
            <button className={styles.quickPill} onClick={() => handleQuickSelect('tonight')}>Tonight</button>
            <button className={styles.quickPill} onClick={() => handleQuickSelect('tomorrow')}>Tomorrow</button>
          </div>

          <div className={styles.divider}><span>OR</span></div>

          <label className={styles.label}>Custom Time</label>
          <div className={styles.inputGroup}>
            <input 
              type="datetime-local" 
              className={styles.input}
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
            />
            <button 
              className={styles.predictBtn}
              onClick={handlePredict}
              disabled={!datetime}
            >
              Analyze
            </button>
          </div>
        </div>
      )}

      {/* LOADING / COLD START STATE */}
      {(loading || isColdStart) && !prediction && (
        <div className={styles.loadingState}>
          <div className={styles.mlScanner}></div>
          <div className={styles.loadingWrapper}>
            <div className={styles.loadingText}>
              <CpuIcon /> 
              {isColdStart 
                ? `Booting AI Engine... [${countdown}s]` 
                : 'Crunching Historical Data...'}
            </div>
            {isColdStart && (
              <p className={styles.coldStartSubtext}>
                System is waking up from standby mode. Establishing secure connection...
              </p>
            )}
          </div>
        </div>
      )}

      {/* RESULT VIEW */}
      {prediction && !loading && !isColdStart && (
        <div className={`${styles.result} ${getLevelClass(prediction.level)}`}>
          
          <div className={styles.resultHeader}>
            <div className={styles.levelBadge}>
              <span className={styles.pulseDot}></span>
              {prediction.level} Demand
            </div>
            <button onClick={handleReset} className={styles.resetBtn} title="New Forecast">
              <RefreshIcon />
            </button>
          </div>
          
          <div className={styles.flexRow}>
            <div className={styles.percentage}>
              {prediction.predicted_occupancy}%
            </div>
            <div className={styles.context}>
              <strong className={styles.contextTime}>{prediction.day} @ {prediction.hour}:00</strong>
              {prediction.is_weekend ? (
                <span className={styles.contextTypeWeekend}>Weekend Pattern</span>
              ) : (
                <span className={styles.contextTypeWeekday}>Weekday Pattern</span>
              )}
            </div>
          </div>

          <div className={styles.meterBg}>
            <div 
              className={styles.meterFill} 
              style={{ width: `${Math.min(prediction.predicted_occupancy, 100)}%` }}
            />
          </div>

          {/* AI FEEDBACK LOOP */}
          <div className={styles.feedbackSection}>
            {feedbackStatus === 'success' ? (
              <span className={styles.feedbackSuccess}>✨ Model weights updated!</span>
            ) : (
              <div className={styles.feedbackAction}>
                <span className={styles.feedbackText}>Is this accurate right now?</span>
                <div className={styles.feedbackBtns}>
                  <button onClick={() => handleFeedback(true)} className={styles.thumbBtn} disabled={feedbackStatus === 'submitting'}>
                    👍
                  </button>
                  <button onClick={() => handleFeedback(false)} className={styles.thumbBtn} disabled={feedbackStatus === 'submitting'}>
                    👎
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default ParkingPredictor;