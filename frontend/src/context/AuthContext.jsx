import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api'; // <--- Ensure this imports your axios instance
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. On Mount: Check for HttpOnly Cookie
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.post('/users/token/refresh/');
        const { access } = response.data;
        
        // --- FIX 1: Attach token to Axios immediately ---
        setAccessToken(access);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        const userData = jwtDecode(access);
        setUser({
             id: userData.user_id, 
             username: userData.username,
             email: userData.email,
             is_staff: userData.is_staff,
             groups: userData.groups || []
        });
      } catch (error) {
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

    // --- FIX 2: Attach token to Axios on Login ---
    setAccessToken(access);
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    
    const userData = jwtDecode(access);
    setUser({ 
         id: userData.user_id, 
         username: userData.username,
         email: email, 
         is_staff: userData.is_staff,
         groups: userData.groups || []
    });
  };

  const register = async (username, email, password) => {
    await api.post('/users/register/', { username, email, password });
    await login(email, password);
  };

  const logout = async () => {
    try {
        await api.post('/users/logout/'); 
    } catch (e) {
        console.error("Logout error", e);
    }
    setUser(null);
    setAccessToken(null);
    
    // --- FIX 3: Remove token from Axios on Logout ---
    delete api.defaults.headers.common['Authorization'];
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