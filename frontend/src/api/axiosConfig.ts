import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Keep console logs only for development environment
const isDevelopment = process.env.NODE_ENV === 'development';

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const method = config.method?.toUpperCase() || 'GET';

    if (isDevelopment) {
      console.log(`Making ${method} request to ${config.baseURL}${config.url}`);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log(`Response from ${response.config.url}: ${response.status}`);
    }
    return response;
  },
  (error) => {
    console.error(`API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    return Promise.reject(error);
  }
);

export default api; 