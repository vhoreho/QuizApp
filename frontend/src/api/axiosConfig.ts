import axios from 'axios';
import { errorLogger } from '../lib/errorLogger';

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
    // Логируем HTTP ошибки
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';

    // Формируем сообщение об ошибке
    const errorMessage = error.response?.data?.message || error.message;
    const fullMessage = `HTTP Error ${status}: ${errorMessage} [${method} ${url}]`;

    // Логируем ошибку
    errorLogger.logError(new Error(fullMessage), {
      status,
      method,
      url,
      data: error.config?.data,
      responseData: error.response?.data,
      source: 'axios-error'
    });

    console.error(`API Error: ${status} - ${errorMessage}`);
    return Promise.reject(error);
  }
);

export default api; 