import axios from 'axios';

// --- CHANGE THIS BLOCK ---
// If VITE_API_URL is set (like in Vercel), use it.
// Otherwise, default to your LIVE Render Backend.
const BASE_URL = import.meta.env.VITE_API_URL || 'https://smart-city-platform-iitb.vercel.app/api';

const api = axios.create({
  baseURL: BASE_URL,
});
// 2. AUTH INTERCEPTOR (Keeps you logged in)
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const { access_token } = JSON.parse(authData);
      if (access_token) {
        config.headers['Authorization'] = `Bearer ${access_token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;