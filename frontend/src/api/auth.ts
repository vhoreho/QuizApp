import api from './axiosConfig';
import { UserRole, User } from '../lib/types';

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterUserData {
  name: string;
  username: string;
  password: string;
  role: UserRole;
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);

    // Store token for auth interceptor
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  registerUser: async (data: RegisterUserData): Promise<User> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Set up interceptor for adding the token to all requests
  setupAuthInterceptor: () => {
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor to handle 401 errors
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token expired or invalid, log the user out
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
}; 