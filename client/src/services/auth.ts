import axiosInstance from '@/utils/axiosInstance';
import type { AuthFormData, AuthResponse } from '@/types/auth';
import { userAPIs } from '@/api/user';

export const authHandler = async (
  formData: AuthFormData,
  isSignup: boolean
): Promise<AuthResponse> => {
  const endpoint = isSignup ? userAPIs.signup : userAPIs.login;
  const response = await axiosInstance.post(endpoint, formData);
  return response.data;
};
export const googleAuthHandler = () => {
  window.open('http://localhost:4000/auth/google', '_self');
};
