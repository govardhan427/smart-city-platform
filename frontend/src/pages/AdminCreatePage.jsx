import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import styles from './AdminCreateEventPage.module.css'; // Reusing styles
import { toast } from 'react-toastify';

const AdminCreatePage = () => {
  const navigate = useNavigate();
  const [resourceType, setResourceType] = useState('event'); // event, facility, parking, announcement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Unified Form State
  const [formData, setFormData] = useState({
    // Shared / Misc
    location: '', image_url: '', google_maps_url: '', price: '',
    
    // Event Fields
    title: '', description: '', date: '', time: '',
    
    // Facility/Parking Fields
    name: '', capacity: '', 
    
    // Parking Only
    rate_per_hour: ''
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
          message: formData.description // Using description field for message
        });
      }
      
      toast.success(`${resourceType.toUpperCase()} Created Successfully!`);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to create resource. Please check inputs.');
      toast.error("Failed to create resource.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create New Resource</h1>
      
      {/* 1. Resource Type Selector */}
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

        {/* --- DYNAMIC FIELDS BASED ON TYPE --- */}

        {/* 1. EVENT FORM */}
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
            <Input label="Google Maps Link" id="google_maps_url" value={formData.google_maps_url} onChange={handleChange} placeholder="https://maps.google.com/..." />
          </>
        )}

        {/* 2. FACILITY FORM */}
        {resourceType === 'facility' && (
          <>
            <Input label="Facility Name" id="name" value={formData.name} onChange={handleChange} required />
            <div className={styles.inputGroup}>
              <label htmlFor="description" className={styles.label}>Description</label>
              <textarea id="description" className={styles.textarea} value={formData.description} onChange={handleChange} rows="3" />
            </div>
            <div className={styles.row}>
              <Input label="Price (₹ per slot)" id="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="0 for Free" />
              <Input label="Capacity (Max People)" id="capacity" type="number" value={formData.capacity} onChange={handleChange} required />
            </div>
            <Input label="Location" id="location" value={formData.location} onChange={handleChange} required />
            <Input label="Image URL" id="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://..." />
            <Input label="Google Maps Link" id="google_maps_url" value={formData.google_maps_url} onChange={handleChange} placeholder="https://maps.google.com/..." />
          </>
        )}

        {/* 3. PARKING FORM */}
        {resourceType === 'parking' && (
          <>
            <Input label="Parking Lot Name" id="name" value={formData.name} onChange={handleChange} required />
            <Input label="Location" id="location" value={formData.location} onChange={handleChange} required />
            <div className={styles.row}>
              <Input label="Total Capacity (Spots)" id="capacity" type="number" value={formData.capacity} onChange={handleChange} required />
              <Input label="Rate (₹ per Hour)" id="rate_per_hour" type="number" step="0.01" value={formData.rate_per_hour} onChange={handleChange} required />
            </div>
            <Input label="Image URL" id="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://..." />
            <Input label="Google Maps Link" id="google_maps_url" value={formData.google_maps_url} onChange={handleChange} placeholder="https://maps.google.com/..." />
          </>
        )}

        {/* 4. ANNOUNCEMENT FORM (NEW) */}
        {resourceType === 'announcement' && (
          <>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Broadcast Message</label>
              <textarea 
                id="description" 
                className={styles.textarea} 
                value={formData.description} 
                onChange={handleChange} 
                rows="3"
                placeholder="e.g. ⚠️ Heavy Rain Alert: Central Parking Closed today."
                maxLength="100"
                required
              />
              <span style={{fontSize: '0.8rem', color: '#888', marginTop: '5px'}}>Max 100 characters. Shows on Home Page ticker.</span>
            </div>
          </>
        )}

        <div className={styles.buttonWrapper}>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : `Create ${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreatePage;