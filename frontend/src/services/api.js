import axios from 'axios';

// Create a new Axios instance with a custom config
const api = axios.create({
  // Point to our Django backend
  baseURL: 'http://127.0.0.1:8000/api', 
});

/*
  This is a request interceptor. It's a function that
  runs BEFORE each request is sent.
*/
api.interceptors.request.use(
  (config) => {
    // 1. Get the token from local storage
    const authData = localStorage.getItem('auth');
    if (authData) {
      const { access_token } = JSON.parse(authData);
      
      // 2. If the token exists, add it to the Authorization header
      if (access_token) {
        config.headers['Authorization'] = `Bearer ${access_token}`;
      }
    }
    return config; // Continue with the request
  },
  (error) => {
    // Handle any request errors
    return Promise.reject(error);
  }
);

export default api;