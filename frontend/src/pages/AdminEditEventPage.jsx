import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api'; // Direct API call or use eventService
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import styles from './AdminCreateEventPage.module.css'; // Reuse the create page styles

const AdminEditEventPage = () => {
  const { id } = useParams(); // Get the Event ID from the URL
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
  });

  // 1. Fetch the existing event data when page loads
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}/`);
        setFormData({
          title: response.data.title,
          description: response.data.description,
          date: response.data.date,
          time: response.data.time, // Ensure time format matches input (HH:MM:SS)
          location: response.data.location,
        });
      } catch (err) {
        setError("Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // 2. Send PUT request to update
      await api.put(`/events/${id}/`, formData);
      
      // On success, go back home
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to update event. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '2rem'}}>Loading event...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Event</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.errorBox}>{error}</div>}

        <Input 
          label="Event Title"
          id="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <div className={styles.inputGroup}>
          <label htmlFor="description" className={styles.label}>Description</label>
          <textarea
            id="description"
            className={styles.textarea}
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className={styles.row}>
          <Input 
            label="Date"
            id="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          <Input 
            label="Time"
            id="time"
            type="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>

        <Input 
          label="Location"
          id="location"
          value={formData.location}
          onChange={handleChange}
          required
        />

        <div className={styles.buttonWrapper}>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving Changes...' : 'Update Event'}
          </Button>
          <div style={{marginTop: '10px'}}>
             <Button type="button" variant="secondary" onClick={() => navigate('/')}>
               Cancel
             </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminEditEventPage;