import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import styles from './AdminCreateEventPage.module.css'; // We'll create this next

const AdminCreateEventPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Send the POST request to create the event
      await api.post('/events/', formData);
      
      // On success, go back to the home page to see the new event
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to create event. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create New Event</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.errorBox}>{error}</div>}

        <Input 
          label="Event Title"
          id="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        {/* Description is a textarea, so we do it manually or make a Textarea component. 
            For now, manual is fine. */}
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
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Publish Event'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateEventPage;