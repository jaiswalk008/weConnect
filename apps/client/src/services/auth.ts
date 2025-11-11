import axiosInstance from '@/utils/axiosInstance';
import type { AuthFormData, AuthResponse } from '@/types/auth';
import { authAPIs } from '@/api/auth';

export const authHandler = async (
  formData: AuthFormData,
  isSignup: boolean
): Promise<AuthResponse> => {
  const endpoint = isSignup ? authAPIs.signup : authAPIs.login;
  const response = await axiosInstance.post(endpoint, formData);
  return response.data;
};
export const googleAuthHandler = () => {
  window.open(`${import.meta.env.VITE_API_URL}/auth/google`, '_self');
};
