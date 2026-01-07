import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api'; 
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  // Start true to prevent showing login page before checking session
  const [loading, setLoading] = useState(true);

  // =========================================================
  // 1. DEFINE ACTIONS FIRST (Must be before useEffect)
  // =========================================================

  const logout = useCallback(async () => {
    try {
        // Attempt to tell backend to clear cookie
        await api.post('/users/logout/'); 
    } catch (e) {
        console.warn("Logout error (likely expired session):", e);
    }

    // Clear Frontend State
    setUser(null);
    setAccessToken(null);
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token'); // Just in case
    
    // Optional: Hard redirect to ensure clean state
    // window.location.href = '/login'; 
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
  // 2. SETUP INTERCEPTOR (The Loop Breaker)
  // =========================================================
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            
            // 🛑 CRITICAL FIX: If the error comes from the REFRESH endpoint itself, 
            // DO NOT try to refresh again. This stops the infinite loop.
            if (originalRequest.url.includes('token/refresh')) {
                // We failed to refresh, so the session is dead.
                return Promise.reject(error);
            }

            // If error is 401 (Unauthorized) AND we haven't retried yet
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    console.log("🔄 Access token expired. Attempting silent refresh...");
                    // Call backend to get new access token using the HttpOnly cookie
                    const response = await api.post('/users/token/refresh/');
                    const { access } = response.data;
                    
                    // Update state & headers
                    setAccessToken(access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${access}`;
                    
                    // Retry the original failed request
                    return api(originalRequest);
                } catch (refreshError) {
                    console.error("❌ Session expired. Logging out.");
                    logout();
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );

    // Cleanup interceptor on unmount
    return () => api.interceptors.response.eject(interceptor);
  }, [logout]); 

  // =========================================================
  // 3. INITIAL CHECK (Fixes "Stuck on Loading")
  // =========================================================
  useEffect(() => {
    const checkAuth = async () => {
        try {
            // Attempt to refresh token silently on page load
            const response = await api.post('/users/token/refresh/');
            const { access } = response.data;
            
            setAccessToken(access);
            api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            
            const userData = jwtDecode(access);
            setUser({ 
                id: userData.user_id, 
                username: userData.username,
                email: userData.email || "User", 
                is_staff: userData.is_staff 
            });
        } catch (error) {
            // It is normal to fail here if the user is not logged in yet.
            console.log("No active session found on load.");
        } finally {
            // ✅ THIS IS THE MOST IMPORTANT LINE
            // It runs whether login succeeds OR fails, turning off the loading screen.
            setLoading(false); 
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

  // Render Loading Screen while checking session
  if (loading) {
    return (
        <div style={{
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: '#000', 
            color: 'white',
            flexDirection: 'column'
        }}>
            <h2>Loading Smart City...</h2>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};