import axios from 'axios';

// --- FIX: USE YOUR VERCEL BACKEND URL ---
// Check your Vercel Dashboard for the backend deployment URL.
// It is likely: https://smart-city-platform-iitb.vercel.app/api 
// (or whatever your BACKEND project is named).

const BASE_URL = 'https://smart-city-platform-iitb.vercel.app/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;