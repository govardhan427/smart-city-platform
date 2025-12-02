import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styles from './LoginPage.module.css'; // Reusing the login page styles

// Import our new reusable components
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
    
    // 1. Check for password match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    // 2. Check for password length (example validation)
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 3. Call the register function from our AuthContext
      await register(username,email, password);
      toast.success("Registration successful! Welcome to the community.");
      // 4. On success, redirect to the homepage
      navigate('/');
    } catch (err) {
      if (err.response?.data?.username) {
        toast.error(`❌ ${err.response.data.username[0]}`);
      } else if (err.response?.data?.email) {
        toast.error(`❌ ${err.response.data.email[0]}`);
      } else {
        toast.error("Registration failed.");
      }
    }finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Create your Account</h2>
        
        {/* Error Message */}
        {error && <div className={styles.errorBox}>{error}</div>}

        <Input 
          label="USERNAME"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="e.g. NeoUser2077"
        />
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
          autoComplete="new-password"
        />
        
        {/* Confirm Password Input (Using reusable component) */}
        <Input 
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />

        {/* Submit Button (Using reusable component) */}
        <Button 
          type="submit" 
          disabled={loading}
          variant="primary"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>

        {/* Link to Login Page */}
        <p className={styles.redirectText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.redirectLink}>
            Log in here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;