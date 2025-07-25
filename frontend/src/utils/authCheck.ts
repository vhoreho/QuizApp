import api from '../api/axiosConfig';

/**
 * Utility function to check if the user is authenticated
 * and if the JWT token is valid
 */
export const checkAuthStatus = async (): Promise<{
  isAuthenticated: boolean;
  userId?: number;
  username?: string;
  error?: string;
}> => {
  try {
    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      return { isAuthenticated: false, error: 'No token found' };
    }

    // Try to fetch user profile
    const response = await api.get('/student/auth-test');
    return {
      isAuthenticated: true,
      userId: response.data.userId,
      username: response.data.username,
    };
  } catch (error) {
    console.error('Auth check failed:', error);
    return {
      isAuthenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Utility function to check if the token is present in localStorage
 */
export const hasToken = (): boolean => {
  return !!localStorage.getItem('token');
};

/**
 * Utility function to get the user ID from localStorage
 */
export const getUserIdFromLocalStorage = (): number | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    return user?.id || null;
  } catch (error) {
    console.error('Error getting user ID from localStorage:', error);
    return null;
  }
};

/**
 * Checks if the authentication token cookie exists
 */
export const hasAuthCookie = (): boolean => {
  return document.cookie.split(';').some(item => item.trim().startsWith('access_token='));
}; 