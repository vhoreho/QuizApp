import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request logging
api.interceptors.request.use(config => {
  const method = config.method?.toUpperCase() || 'GET';
  console.log(`Making ${method} request to ${config.baseURL}${config.url}`);
  return config;
});

// Add response logging
api.interceptors.response.use(
  response => {
    console.log(`Response from ${response.config.url}: ${response.status}`);
    return response;
  },
  error => {
    console.error(`API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    return Promise.reject(error);
  }
);

export default api; 