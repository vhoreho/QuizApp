import axios from 'axios';

// Определяем, находимся ли мы в режиме разработки или производства
// В Vite используем import.meta.env вместо process.env
const isDevelopment = import.meta.env.DEV;

// Получаем базовый URL API из переменных окружения Vite
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Создаем экземпляр Axios с настройками по умолчанию
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Тайм-аут в миллисекундах
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Получаем токен из localStorage
    const token = localStorage.getItem('token');

    // Если токен существует, добавляем его в заголовки
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (isDevelopment) {
        console.log(`Adding Authorization header with token for ${config.url}`);
      }
    } else {
      if (isDevelopment) {
        console.warn(`No token found for request to ${config.url}`);
      }
    }

    if (isDevelopment) {
      console.log(`Request to ${config.url} with method ${config.method}`);
      console.log('Request headers:', config.headers);
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    if (isDevelopment) {
      console.log(`Response from ${response.config.url}:`, response.status);
    }
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response) {
      console.error(
        `Error response from ${error.config?.url}:`,
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 