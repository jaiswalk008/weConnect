import Cookies from 'js-cookie';
import { AUTH_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '../constants/auth';
import { authRoutes } from '../routes/routes';

export const authUtils = {
  // Set authentication token
  setAuthToken: (token: string, expiresInDays: number = 1) => {
    Cookies.set(AUTH_COOKIE_NAME, token, {
      expires: expiresInDays,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  },

  // Get authentication token
  getAuthToken: (): string | undefined => {
    return Cookies.get(AUTH_COOKIE_NAME);
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = Cookies.get(AUTH_COOKIE_NAME);
    return !!token;
  },

  // Remove authentication token
  removeAuthToken: () => {
    Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
  },

  // Logout user
  logout: () => {
    Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
    Cookies.remove(REFRESH_TOKEN_COOKIE_NAME, { path: '/' });
    localStorage.removeItem('userData');
    window.location.href = authRoutes.LOGIN;
  },

  setRefreshToken: (token: string, expiresInDays: number = 14) => {
    Cookies.set(REFRESH_TOKEN_COOKIE_NAME, token, {
      expires: expiresInDays,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  },

  getRefreshToken: (): string | undefined => {
    return Cookies.get(REFRESH_TOKEN_COOKIE_NAME);
  },

  removeRefreshToken: () => {
    Cookies.remove(REFRESH_TOKEN_COOKIE_NAME, { path: '/' });
  },
};
