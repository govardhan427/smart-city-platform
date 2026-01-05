import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api'; 
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // 1. DEFINE ACTIONS FIRST (Fixes Initialization Error)
  // =========================================================

  // Use useCallback to keep the reference stable for dependencies
  const logout = useCallback(async () => {
    try {
        await api.post('/users/logout/'); 
    } catch (e) {
        console.error("Logout error", e);
    }
    setUser(null);
    setAccessToken(null);
    delete api.defaults.headers.common['Authorization'];
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/users/token/', { email, password });
    const { access } = response.data;

    setAccessToken(access);
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    
    const userData = jwtDecode(access);
    setUser({ 
         id: userData.user_id, 
         username: userData.username,
         email: email, 
         is_staff: userData.is_staff
    });
  };

  const register = async (username, email, password) => {
    await api.post('/users/register/', { username, email, password });
    await login(email, password);
  };

  // =========================================================
  // 2. SETUP INTERCEPTOR (Now it can safely use 'logout')
  // =========================================================
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    // Try to get new token via HttpOnly cookie
                    const response = await api.post('/users/token/refresh/');
                    const { access } = response.data;
                    
                    setAccessToken(access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${access}`;
                    
                    return api(originalRequest);
                } catch (refreshError) {
                    logout(); // Safely called now
                }
            }
            return Promise.reject(error);
        }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, [logout]); 

  // =========================================================
  // 3. INITIAL CHECK (Prevent stuck loading screen)
  // =========================================================
  useEffect(() => {
    const checkAuth = async () => {
        try {
            // Try to refresh token on page load to see if user is logged in
            const response = await api.post('/users/token/refresh/');
            const { access } = response.data;
            
            setAccessToken(access);
            api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            
            const userData = jwtDecode(access);
            setUser({ 
                id: userData.user_id, 
                username: userData.username,
                email: userData.email || "User", // Fallback if email not in token
                is_staff: userData.is_staff 
            });
        } catch (error) {
            // User is not logged in, that's fine
            console.log("No active session found");
        } finally {
            setLoading(false); // STOP LOADING
        }
    };
    checkAuth();
  }, []);

  const value = {
    user,
    accessToken,
    loading,
    login,
    register,
    logout,
  };

  if (loading) {
    return (
        <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: 'white'}}>
            Loading session...
        </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};