import { configureStore } from '@reduxjs/toolkit';
import authSlice from './auth';
import friendSlice from './friend';
import chatSlice from './chat';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    friend: friendSlice.reducer,
    chat: chatSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const authActions = authSlice.actions;
export const friendActions = friendSlice.actions;
export const chatActions = chatSlice.actions;
