import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import styles from './AdminCreateEventPage.module.css';
import { toast } from 'react-toastify';

const AdminCreateEventPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '', // Added price field in case you need it later
    image_url: '' // Added image field
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

    try {
      await api.post('/events/', formData);
      toast.success("✨ Event Published Successfully!");
      navigate('/events'); // Redirect to events list instead of home
    } catch (err) {
      console.error(err);
      toast.error("Failed to create event. Check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Initialize Event</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        
        <Input 
          label="Event Title"
          id="title"
          placeholder="e.g. Tech Summit 2026"
          value={formData.title}
          onChange={handleChange}
          required
        />

        {/* Manual Textarea styling to match Glass Input */}
        <div className={styles.inputGroup}>
          <label htmlFor="description" className={styles.label}>Description</label>
          <textarea
            id="description"
            className={styles.textarea}
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Enter event details..."
            required
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
          placeholder="e.g. Grand Hall / Google Maps Link"
          value={formData.location}
          onChange={handleChange}
          required
        />

        {/* Optional: Add Image & Price inputs if your backend supports them */}
        {/* <div className={styles.row}>
             <Input label="Price (₹)" id="price" type="number" value={formData.price} onChange={handleChange} />
             <Input label="Image URL" id="image_url" value={formData.image_url} onChange={handleChange} />
        </div> 
        */}

        <div className={styles.buttonWrapper}>
          <Button type="submit" disabled={loading} variant="primary">
            {loading ? 'Processing...' : '🚀 Publish Event'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateEventPage;