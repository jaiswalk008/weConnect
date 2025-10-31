import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FriendsData } from '@/types/friend';

const initialAuthState: FriendsData = {
  onlineFriends: [],
  offlineFriends: [],
  pendingFriends: [],
  requestFriends: [],
};

const friendSlice = createSlice({
  name: 'friend',
  initialState: initialAuthState,
  reducers: {
    setFriends: (state, action: PayloadAction<FriendsData>) => {
      state.onlineFriends = action.payload.onlineFriends;
      state.offlineFriends = action.payload.offlineFriends;
      state.pendingFriends = action.payload.pendingFriends;
      state.requestFriends = action.payload.requestFriends;
    },
  },
});

export default friendSlice;
