import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized / Global Errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401 Unauthorized
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      // Dispatch custom event so AuthContext can update state if mounted
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(
      error.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: error.message || 'An unexpected error occurred'
      }
    );
  }
);

export default api;
