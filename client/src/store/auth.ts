'use client';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { userAuthState } from '@/types/user';
import { authUtils } from '@/utils/auth';

interface AuthState {
  userData: userAuthState;
  token: string;
  refreshToken: string;
}

const initialAuthState: AuthState = {
  userData: { name: '', email: '', profile_image: '', username: '' } as userAuthState,
  token: '',
  refreshToken: '',
};

const authSlice = createSlice({
  name: 'authentication',
  initialState: initialAuthState,
  reducers: {
    setUserData: (state, action: PayloadAction<userAuthState>) => {
      state.userData = action.payload;
      // Note: localStorage usage may cause issues in SSR
      if (typeof window !== 'undefined') {
        localStorage.setItem('userData', JSON.stringify(action.payload));
      }
    },
    logout: state => {
      state.userData = { name: '', email: '', profile_image: '', username: '' };
      state.token = '';
      state.refreshToken = '';
      authUtils.logout();
    },
    initializeToken: (
      state,
      action: PayloadAction<{ authToken: string; refreshToken: string }>
    ) => {
      if (typeof window !== 'undefined') {
        const { authToken, refreshToken } = action.payload;
        state.token = authToken;
        state.refreshToken = refreshToken;
        authUtils.setAuthToken(authToken);
        authUtils.setRefreshToken(refreshToken);
      }
    },
  },
});

export default authSlice;
