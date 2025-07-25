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
  withCredentials: true, // Enable sending cookies
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
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear local storage
      localStorage.removeItem('user');

      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 