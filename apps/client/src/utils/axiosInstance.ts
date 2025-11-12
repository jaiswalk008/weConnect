import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { authUtils } from '../utils/auth';
import { authRoutes } from '@/routes/routes';

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Request interceptor - Add auth token to headers
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authUtils.getAuthToken();

    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return successful response as-is
    return response;
  },
  (error: AxiosError) => {
    // Handle different error status codes
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          // Unauthorized - Clear auth and redirect to login
          if (window.location.pathname !== authRoutes.LOGIN) {
            authUtils.removeAuthToken();
            window.location.href = authRoutes.LOGIN;
          }
          break;

        case 403:
          // Forbidden - User doesn't have permission
          // console.error('Access forbidden:', error.response.data);
          break;

        case 404:
          // Not found
          // console.error('Resource not found:', error.response.data);
          break;

        case 500:
          // Server error
          // console.error('Server error:', error.response.data);
          break;

        default:
          // console.error('API error:', error.response.data);
          break;
      }
    } else if (error.request) {
      // Request was made but no response received
      // console.error('Network error: No response from server');
    } else {
      // Something else happened
      // console.error('Error:', error.message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
