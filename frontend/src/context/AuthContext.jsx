import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. On Mount: Try to refresh the token to check if we are logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // The browser automatically sends the HttpOnly cookie with this request
        const response = await api.post('/users/token/refresh/');
        const { access } = response.data;
        
        setAccessToken(access);
        
        // Decode access token to get user data
        const userData = jwtDecode(access);
        setUser({
             id: userData.user_id, 
             username: userData.username,
             email: userData.email,
             is_staff: userData.is_staff,
             groups: userData.groups || []
        });
      } catch (error) {
        // If refresh fails (no cookie or expired), we remain logged out
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/users/token/', { email, password });
    const { access } = response.data;

    // Save Access Token in Memory (State) ONLY
    setAccessToken(access);
    
    const userData = jwtDecode(access);
    setUser({ 
         id: userData.user_id, 
         username: userData.username,
         email: email, 
         is_staff: userData.is_staff,
         groups: userData.groups || []
    });
    // Note: We don't save to localStorage anymore!
  };

  const register = async (username, email, password) => {
    await api.post('/users/register/', { username, email, password });
    await login(email, password);
  };

  const logout = async () => {
    try {
        // Call backend to delete the cookie
        await api.post('/users/logout/'); 
    } catch (e) {
        console.error("Logout error", e);
    }
    setUser(null);
    setAccessToken(null);
  };

  const value = {
    user,
    accessToken,
    loading,
    login,
    register,
    logout,
  };

  if (loading) {
    return <div>Loading session...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};