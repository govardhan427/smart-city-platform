import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api'; // <--- Ensure this imports your axios instance
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. On Mount: Check for HttpOnly Cookie
  // Add this inside the useEffect in AuthContext.js
useEffect(() => {
    // 1. Response Interceptor
    const interceptor = api.interceptors.response.use(
        (response) => response, // Return success responses as is
        async (error) => {
            const originalRequest = error.config;
            
            // If error is 401 (Unauthorized) AND we haven't retried yet
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true; // Mark as retried
                try {
                    // Ask backend for new token (browser sends cookie automatically)
                    const response = await api.post('/users/token/refresh/');
                    const { access } = response.data;
                    
                    // Update header and state
                    setAccessToken(access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                    
                    // Retry original request with new token
                    originalRequest.headers['Authorization'] = `Bearer ${access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // If refresh fails (cookie expired), logout
                    logout();
                }
            }
            return Promise.reject(error);
        }
    );

    // Cleanup
    return () => api.interceptors.response.eject(interceptor);
}, [logout]); // dependency array

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