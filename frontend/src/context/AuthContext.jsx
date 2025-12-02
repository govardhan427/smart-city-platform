import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api'; // Our new api service
import { jwtDecode } from 'jwt-decode'; // We need this to read the token

// 1. Create the Context
export const AuthContext = createContext(null);

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true); // Loading on app start

  // On component mount, check localStorage for existing auth data
  useEffect(() => {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const { access_token, user_data } = JSON.parse(authData);
      if (access_token && user_data) {
        setAccessToken(access_token);
        setUser(user_data);
      }
    }
    setLoading(false);
  }, []);

  // Helper function to set auth state and save to localStorage
  const setAuthState = (token, userData) => {
    // 1. Set state
    setAccessToken(token);
    setUser(userData);
    
    // 2. Save to local storage
    localStorage.setItem(
      'auth',
      JSON.stringify({
        access_token: token,
        user_data: userData,
      })
    );
  };

  // --- Auth Functions ---

  const login = async (email, password) => {
    const response = await api.post('/users/token/', { email, password });
    const { access, refresh } = response.data;

    // Decode the token to get user info (like is_staff)
    const userData = jwtDecode(access); 
    
    // Use our helper to save everything
    setAuthState(access, { 
      id: userData.user_id, 
      email: email, 
      is_staff: userData.is_staff,
      groups: userData.groups || [] // <-- Add this
    });
    // We don't use the refresh token in this 20% scope, but you would store it here
  };

  const register = async (email, password) => {
    // This endpoint doesn't return a token, so we just log the user in after
    await api.post('/users/register/', { email, password });
    
    // After successful registration, log them in
    await login(email, password);
  };

  const logout = () => {
    // Clear state
    setUser(null);
    setAccessToken(null);
    
    // Clear local storage
    localStorage.removeItem('auth');
  };

  // The value that will be provided to all consuming components
  const value = {
    user,
    accessToken,
    loading,
    login,
    register,
    logout,
  };

  // Don't render the app until we've checked for a token
  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};