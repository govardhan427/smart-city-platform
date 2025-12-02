import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styles from './LoginPage.module.css'; // For the container and form layout

// Import our new reusable components
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form browser submission
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the login function from our AuthContext
      await login(email, password);
      
      // On success, redirect to the homepage
      navigate('/');
    } catch (err) { // This block is now syntactically correct
      if (err.response && err.response.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError('Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Login to your Account</h2>
        
        {/* Error Message */}
        {error && <div className={styles.errorBox}>{error}</div>}

        {/* Email Input (Using reusable component) */}
        <Input 
          label="Email Address"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        {/* Password Input (Using reusable component) */}
        <Input 
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {/* Submit Button (Using reusable component) */}
        <Button 
          type="submit" 
          disabled={loading}
          variant="primary" // This prop selects the style from Button.module.css
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        {/* Link to Register Page */}
        <p className={styles.redirectText}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.redirectLink}>
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;