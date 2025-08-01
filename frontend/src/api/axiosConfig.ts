import axios from 'axios';

const isDevelopment = import.meta.env.DEV;
const baseURL = import.meta.env.VITE_API_URL || 'http://192.168.1.100:3001';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    if (isDevelopment) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log('[API Request Body]:', config.data);
      }
      if (config.params) {
        console.log('[API Request Params]:', config.params);
      }
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}:`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error) => {
    if (isDevelopment) {
      console.error('[API Response Error]:', {
        config: {
          method: error.config?.method,
          url: error.config?.url,
        },
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    if (error.response?.status === 401) {
      // Clear user data
      localStorage.removeItem('user');

      // Let the error propagate to be handled by the components
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api; 