import axios from 'axios';

// --- CONFIGURATION ---
// 1. Check for an environment variable (for Localhost: http://127.0.0.1:8000/api)
// 2. If not found, fall back to your LIVE Backend URL
const BASE_URL = import.meta.env.VITE_API_URL || 'https://smart-city-platform-iitb.vercel.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // CRITICAL: This allows the browser to send the HttpOnly Cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// NOTE: We REMOVED the interceptor.
// Why? We no longer store tokens in localStorage.
// Your AuthContext.js now handles injecting the token into headers automatically.

export default api;