import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import styles from './AdminCreateEventPage.module.css'; // Shared styles
import { toast } from 'react-toastify';

const AdminCreatePage = () => {
  const navigate = useNavigate();
  const [resourceType, setResourceType] = useState('event');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Unified Form State
  const [formData, setFormData] = useState({
    location: '', image_url: '', google_maps_url: '', price: '',
    title: '', description: '', date: '', time: '',
    name: '', capacity: '', rate_per_hour: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (resourceType === 'event') {
        await api.post('/events/', {
          title: formData.title,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          price: formData.price || 0,
          image_url: formData.image_url,
          google_maps_url: formData.google_maps_url
        });
      } 
      else if (resourceType === 'facility') {
        await api.post('/facilities/create/', {
          name: formData.name,
          description: formData.description,
          location: formData.location,
          capacity: formData.capacity,
          price: formData.price || 0,
          image_url: formData.image_url,
          google_maps_url: formData.google_maps_url
        });
      } 
      else if (resourceType === 'parking') {
        await api.post('/transport/parking/create/', {
          name: formData.name,
          location: formData.location,
          total_capacity: formData.capacity,
          rate_per_hour: formData.rate_per_hour,
          image_url: formData.image_url,
          google_maps_url: formData.google_maps_url
        });
      }
      else if (resourceType === 'announcement') {
        await api.post('/analytics/announcement/', {
          message: formData.description
        });
      }
      
      toast.success(`${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} Created Successfully!`);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to create resource. Please check your inputs.');
      toast.error("Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Initialize Resource</h1>
      
      {/* 1. TYPE SELECTOR */}
      <div className={styles.toggleContainer}>
        {['event', 'facility', 'parking', 'announcement'].map(type => (
          <button
            key={type}
            type="button"
            onClick={() => { setResourceType(type); setError(null); }}
            className={`${styles.toggleBtn} ${resourceType === type ? styles.activeBtn : ''}`}
          >
            {type}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.errorBox}>{error}</div>}

        {/* --- EVENT FIELDS --- */}
        {resourceType === 'event' && (
          <>
            <Input label="Event Title" id="title" value={formData.title} onChange={handleChange} required />
            <div className={styles.inputGroup}>
              <label htmlFor="description" className={styles.label}>Description</label>
              <textarea id="description" className={styles.textarea} value={formData.description} onChange={handleChange} rows="3" />
            </div>
            <div className={styles.row}>
              <Input label="Date" id="date" type="date" value={formData.date} onChange={handleChange} required />
              <Input label="Time" id="time" type="time" value={formData.time} onChange={handleChange} required />
            </div>
            <div className={styles.row}>
              <Input label="Price (₹)" id="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="0 for Free" />
              <Input label="Location" id="location" value={formData.location} onChange={handleChange} required />
            </div>
            <Input label="Image URL" id="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://..." />
            <Input label="Maps Link" id="google_maps_url" value={formData.google_maps_url} onChange={handleChange} placeholder="https://maps.google.com/..." />
          </>
        )}

        {/* --- FACILITY FIELDS --- */}
        {resourceType === 'facility' && (
          <>
            <Input label="Facility Name" id="name" value={formData.name} onChange={handleChange} required />
            <div className={styles.inputGroup}>
              <label htmlFor="description" className={styles.label}>Description</label>
              <textarea id="description" className={styles.textarea} value={formData.description} onChange={handleChange} rows="3" />
            </div>
            <div className={styles.row}>
              <Input label="Price (₹/slot)" id="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="0 for Free" />
              <Input label="Capacity" id="capacity" type="number" value={formData.capacity} onChange={handleChange} required />
            </div>
            <Input label="Location" id="location" value={formData.location} onChange={handleChange} required />
            <Input label="Image URL" id="image_url" value={formData.image_url} onChange={handleChange} />
            <Input label="Maps Link" id="google_maps_url" value={formData.google_maps_url} onChange={handleChange} />
          </>
        )}

        {/* --- PARKING FIELDS --- */}
        {resourceType === 'parking' && (
          <>
            <Input label="Parking Lot Name" id="name" value={formData.name} onChange={handleChange} required />
            <Input label="Location" id="location" value={formData.location} onChange={handleChange} required />
            <div className={styles.row}>
              <Input label="Total Capacity" id="capacity" type="number" value={formData.capacity} onChange={handleChange} required />
              <Input label="Rate (₹/Hour)" id="rate_per_hour" type="number" step="0.01" value={formData.rate_per_hour} onChange={handleChange} required />
            </div>
            <Input label="Image URL" id="image_url" value={formData.image_url} onChange={handleChange} />
            <Input label="Maps Link" id="google_maps_url" value={formData.google_maps_url} onChange={handleChange} />
          </>
        )}

        {/* --- ANNOUNCEMENT FIELDS --- */}
        {resourceType === 'announcement' && (
          <div className={styles.inputGroup}>
            <label className={styles.label}>Broadcast Message</label>
            <textarea 
              id="description" 
              className={styles.textarea} 
              value={formData.description} 
              onChange={handleChange} 
              rows="3"
              placeholder="e.g. ⚠️ Central Parking is currently full."
              maxLength="100"
              required
            />
            <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '5px'}}>
              Displays on the Global News Ticker (Max 100 chars).
            </span>
          </div>
        )}

        <div className={styles.buttonWrapper}>
          <Button type="submit" disabled={loading} variant="primary" style={{width: '100%'}}>
            {loading ? 'Processing...' : 'Confirm Creation'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreatePage;