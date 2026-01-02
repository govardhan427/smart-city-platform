import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import styles from './AdminCreateEventPage.module.css';
import { toast } from 'react-toastify';

const AdminCreatePage = () => {
  const navigate = useNavigate();
  const [resourceType, setResourceType] = useState('event');
  const [loading, setLoading] = useState(false);
  
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

    try {
      // ... (Keep existing submission logic) ...
      if (resourceType === 'event') {
        await api.post('/events/', { ...formData, price: formData.price || 0 });
      } 
      else if (resourceType === 'facility') {
        await api.post('/facilities/create/', { ...formData, price: formData.price || 0 });
      } 
      else if (resourceType === 'parking') {
        await api.post('/transport/parking/create/', { 
          ...formData, total_capacity: formData.capacity 
        });
      }
      else if (resourceType === 'announcement') {
        await api.post('/analytics/announcement/', { message: formData.description });
      }
      
      toast.success(`${resourceType.toUpperCase()} Created!`);
      navigate('/');
    } catch (err) {
      toast.error("Failed to create resource.");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
      if (type === 'event') return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>;
      if (type === 'facility') return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18M5 21V7l8-4 8 4v14M17 21v-8.5a1.5 1.5 0 0 0-1.5-1.5h-5a1.5 1.5 0 0 0-1.5 1.5V21" />
            </svg>;
      if (type === 'parking') return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M9 14v-4h3a2 2 0 0 1 0 4h-3" />
            </svg>;
      return <svg fill="#d7d2d2ff" height="24px" width="24px" version="1.1" id="XMLID_264_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 0.72 0.72" xml:space="preserve"><g id="announcement"><g><path d="M0.36 0.72H0.18v-0.21c-0.099 0 -0.18 -0.081 -0.18 -0.18s0.081 -0.18 0.18 -0.18h0.15c0.108 0 0.219 -0.102 0.219 -0.102L0.6 0v0.21c0.066 0 0.12 0.054 0.12 0.12s-0.054 0.12 -0.12 0.12v0.204l-0.051 -0.045S0.456 0.525 0.36 0.51zm-0.12 -0.06h0.06v-0.15H0.24zm0.12 -0.207c0.072 0.009 0.138 0.045 0.18 0.075V0.132c-0.042 0.03 -0.108 0.069 -0.18 0.078zM0.18 0.45h0.12V0.21H0.18c-0.066 0 -0.12 0.054 -0.12 0.12s0.054 0.12 0.12 0.12m0.42 -0.12v0.06c0.033 0 0.06 -0.027 0.06 -0.06s-0.027 -0.06 -0.06 -0.06z"/></g></g></svg>;
  };

  return (
    <div className={styles.container}>
      
      {/* --- SIDEBAR (Becomes Top Nav on Mobile) --- */}
      <div className={styles.sidebar}>
        <h1 className={styles.sidebarTitle}>Create Resource</h1>
        
        {/* Added navGroup wrapper for mobile scrolling */}
        <div className={styles.navGroup}>
            {['event', 'facility', 'parking', 'announcement'].map(type => (
            <button
                key={type}
                type="button"
                onClick={() => setResourceType(type)}
                className={`${styles.toggleBtn} ${resourceType === type ? styles.activeBtn : ''}`}
            >
                <span>{getIcon(type)}</span>
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
            ))}
        </div>
      </div>

      {/* --- FORM PANEL --- */}
      <form onSubmit={handleSubmit} className={styles.formPanel}>
        
        <div className={styles.formHeader}>
            <div className={styles.formTitle}>
                {/* Large Icon for Desktop Header */}
                <span style={{fontSize: '1.5rem', background: 'rgba(255,255,255,0.1)', width: '40px', height: '40px', borderRadius: '10px', display: 'grid', placeItems: 'center'}}>
                    {getIcon(resourceType)}
                </span>
                New {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}
            </div>
        </div>

        <div className={styles.formGrid}>
          {/* ... (Keep all existing form fields exactly as they were) ... */}
          
          {resourceType === 'event' && (
            <>
              <div className={styles.fullWidth}>
                <Input label="Event Title" id="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea id="description" className={styles.textarea} value={formData.description} onChange={handleChange} />
              </div>
              <Input label="Date" id="date" type="date" value={formData.date} onChange={handleChange} required />
              <Input label="Time" id="time" type="time" value={formData.time} onChange={handleChange} required />
              <Input label="Location" id="location" value={formData.location} onChange={handleChange} required />
              <Input label="Price (₹)" id="price" type="number" value={formData.price} onChange={handleChange} />
              <div className={styles.fullWidth}>
                 <Input label="Image URL" id="image_url" value={formData.image_url} onChange={handleChange} />
              </div>
            </>
          )}

          {resourceType === 'facility' && (
            <>
               <div className={styles.fullWidth}>
                 <Input label="Facility Name" id="name" value={formData.name} onChange={handleChange} required />
               </div>
               <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Description</label>
                  <textarea id="description" className={styles.textarea} value={formData.description} onChange={handleChange} />
               </div>
               <Input label="Capacity" id="capacity" type="number" value={formData.capacity} onChange={handleChange} required />
               <Input label="Price (₹/Slot)" id="price" type="number" value={formData.price} onChange={handleChange} />
               <div className={styles.fullWidth}>
                 <Input label="Location" id="location" value={formData.location} onChange={handleChange} required />
               </div>
               <div className={styles.fullWidth}>
                 <Input label="Image URL" id="image_url" value={formData.image_url} onChange={handleChange} />
               </div>
            </>
          )}

          {resourceType === 'parking' && (
            <>
               <div className={styles.fullWidth}>
                 <Input label="Parking Lot Name" id="name" value={formData.name} onChange={handleChange} required />
               </div>
               <Input label="Total Capacity" id="capacity" type="number" value={formData.capacity} onChange={handleChange} required />
               <Input label="Rate (₹/Hour)" id="rate_per_hour" type="number" value={formData.rate_per_hour} onChange={handleChange} required />
               <div className={styles.fullWidth}>
                 <Input label="Location" id="location" value={formData.location} onChange={handleChange} required />
               </div>
               <div className={styles.fullWidth}>
                 <Input label="Image URL" id="image_url" value={formData.image_url} onChange={handleChange} />
               </div>
            </>
          )}

          {resourceType === 'announcement' && (
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Broadcast Message</label>
              <textarea 
                id="description" 
                className={styles.textarea} 
                style={{height: '150px'}}
                value={formData.description} 
                onChange={handleChange} 
                maxLength="100"
                required
                placeholder="Alert message for the ticker..."
              />
            </div>
          )}
        </div>

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