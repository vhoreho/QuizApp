import api from '../api/axiosConfig';

/**
 * Checks if the user is authenticated by making a lightweight API call
 */
export const checkAuthStatus = async (): Promise<{
  isAuthenticated: boolean;
  userId?: number;
  username?: string;
  error?: string;
}> => {
  try {
    const response = await api.get('/auth/check');
    return {
      isAuthenticated: true,
      userId: response.data.user.id,
      username: response.data.user.username,
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
 * Gets the user data from localStorage
 */
export const getUserFromLocalStorage = (): any | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    return null;
  }
};

/**
 * Checks if the user data exists in localStorage
 */
export const hasUserData = (): boolean => {
  return !!getUserFromLocalStorage();
};

/**
 * Checks if we should attempt authentication
 * This is used to prevent unnecessary API calls when we know the user isn't logged in
 */
export const hasAuthCookie = async (): Promise<boolean> => {
  try {
    // Make a lightweight request to check auth status
    const response = await api.get('/auth/check');
    return response.data.isAuthenticated;
  } catch (error) {
    console.error('Auth cookie check failed:', error);
    return false;
  }
}; 