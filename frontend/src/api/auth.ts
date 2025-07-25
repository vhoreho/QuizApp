import api from './axiosConfig';
import { LoginData, AuthResponse, RegisterUserData, User } from '@/lib/types';

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);

    // Store user data only (token is in HTTP-only cookie)
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
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

  checkAuth: async (): Promise<{ isAuthenticated: boolean; user: User | null }> => {
    try {
      const response = await api.get('/auth/check');
      return response.data;
    } catch (error) {
      return { isAuthenticated: false, user: null };
    }
  }
}; 