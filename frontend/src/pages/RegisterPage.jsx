import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
// Reuse the glass styling from Login to ensure consistency
import styles from './LoginPage.module.css'; 

import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validation
    if (password !== confirmPassword) {
      toast.warn("Passwords do not match.");
      return;
    }
    
    if (password.length < 8) {
      toast.warn("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(username, email, password);
      toast.success("Welcome to CityOS! Account initialized.");
      navigate('/');
    } catch (err) {
      // Backend error handling
      if (err.response?.data?.username) {
        setError(`Username error: ${err.response.data.username[0]}`);
      } else if (err.response?.data?.email) {
        setError(`Email error: ${err.response.data.email[0]}`);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        
        <h2 className={styles.title}>New Resident Registration</h2>
        
        {/* Error Message */}
        {error && <div className={styles.errorBox}>{error}</div>}

        <Input 
          label="Choose Username"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="e.g. govardhan427"
        />

        <Input 
          label="Email Address"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="user@smartcity.com"
        />

        <Input 
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="Min. 8 characters"
        />
        
        <Input 
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="Repeat password"
        />

        <div style={{ marginTop: '20px' }}>
            <Button 
                type="submit" 
                disabled={loading} 
                variant="primary"
                style={{ width: '100%' }}
            >
                {loading ? 'Initializing ID...' : 'Create Account'}
            </Button>
        </div>

        {/* Footer Links */}
        <div className={styles.redirectText}>
          Already a resident?
          <Link to="/login" className={styles.redirectLink}>
            Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;