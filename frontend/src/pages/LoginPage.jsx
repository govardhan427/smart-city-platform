import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styles from './LoginPage.module.css';

// Reusable Components
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    if (!email || !password) {
      toast.warn("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      toast.success("Welcome back to CityOS");
      navigate('/');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Incorrect email or password.');
      } else {
        setError('Server unavailable. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        
        <h2 className={styles.title}>System Access</h2>
        
        {error && <div className={styles.errorBox}>{error}</div>}

        <Input 
          label="Email Identity"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="citizen@smartcity.com"
        />

        <Input 
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />

        <div style={{ marginTop: '10px' }}>
          <Button 
            type="submit" 
            disabled={loading}
            variant="primary"
            style={{ width: '100%' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </div>

        <div className={styles.redirectText}>
          New resident?
          <Link to="/register" className={styles.redirectLink}>
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;