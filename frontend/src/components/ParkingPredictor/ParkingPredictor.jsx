import React, { useState } from 'react';
import api from '../../services/api';
import styles from './ParkingPredictor.module.css';

const ParkingPredictor = () => {
  const [datetime, setDatetime] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async () => {
    if (!datetime) return;
    
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      // The backend expects ISO format: "2026-10-25T18:00:00"
      const res = await api.post('/transport/predict/', { datetime: datetime });
      setPrediction(res.data);
    } catch (err) {
      console.error("Prediction failed", err);
      setError("Unable to connect to AI Engine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Determine CSS class based on level string from backend
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
        <span className={styles.icon}>🚗</span>
        <div>
          <h3 className={styles.title}>Smart Traffic Forecast</h3>
          <span className={styles.subtitle}>Powered by Random Forest Regression</span>
        </div>
      </div>

      <label className={styles.label}>Select Date & Time</label>
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
          {loading ? 'Analyzing...' : 'Predict'}
        </button>
      </div>

      {error && <div className="text-red-400 text-sm text-center mb-4">{error}</div>}

      {prediction && (
        <div className={`${styles.result} ${getLevelClass(prediction.level)}`}>
          <div className={styles.levelTag}>
            {prediction.level} Demand
          </div>
          
          <div className={styles.percentage}>
            {prediction.predicted_occupancy}%
          </div>

          <div className={styles.meterBg}>
            <div 
              className={styles.meterFill} 
              style={{ width: `${prediction.predicted_occupancy}%` }}
            />
          </div>

          <p className={styles.context}>
            Forecast based on historical data for a<br/>
            <strong className="text-white"> {prediction.day}</strong> at 
            <strong className="text-white"> {prediction.hour}:00</strong>
            {prediction.is_weekend && <span className="text-yellow-400 ml-1">(Weekend)</span>}
          </p>
        </div>
      )}
    </div>
  );
};

export default ParkingPredictor;