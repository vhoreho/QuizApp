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
    }

    if (isDevelopment) {
      console.log(`Request to ${config.url} with method ${config.method}`);
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

    // Логируем ошибку в консоль
    console.error(fullMessage);
    console.error('API Error details:', {
      status,
      method,
      url,
      data: error.config?.data,
      responseData: error.response?.data,
    });

    return Promise.reject(error);
  }
);

export default api; 