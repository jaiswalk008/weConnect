import axiosInstance from '@/utils/axiosInstance';
import { userAPIs } from '@/api/user';

export const getMe = () => {
  return axiosInstance.get(userAPIs.me);
};

export const updateUsername = (username: string) => {
  return axiosInstance.patch(userAPIs.username, { username });
};

export const updateProfileImage = (profile_image: string) => {
  return axiosInstance.patch(userAPIs.profileImage, { profile_image });
};
