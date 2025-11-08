import { MessageStatus, type MessageData } from '@/types/socket';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/socket';
import type { userAuthState } from '@/types/user';

interface chatState {
  chatData: MessageData[];
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
}

const initialState: chatState = {
  chatData: [],
  socket: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatData: (state, action: PayloadAction<MessageData[]>) => {
      state.chatData = action.payload;
    },
    addMessage: (state, action: PayloadAction<MessageData>) => {
      state.chatData.push(action.payload);
    },
    removeMessage: (state, action: PayloadAction<number>) => {
      state.chatData = state.chatData.filter(message => message.id !== action.payload);
    },
    updateMessage: (state, action: PayloadAction<MessageData>) => {
      state.chatData = state.chatData.map(message =>
        message.id === action.payload.id ? action.payload : message
      );
    },
    updateMessageStatus: (state, action: PayloadAction<MessageData>) => {
      state.chatData = state.chatData.map(message =>
        message.id === action.payload.id ? action.payload : message
      );
    },
    markMessagesAsRead: (
      state,
      action: PayloadAction<{
        messageIds: number[];
        chatId: number;
        user: userAuthState;
        timestamp: Date;
      }>
    ) => {
      state.chatData = state.chatData.map(message =>
        action.payload.messageIds.includes(message.id)
          ? { ...message, status: MessageStatus.READ }
          : message
      );
    },
    clearChatData: state => {
      state.chatData = [];
    },
  },
});

export default chatSlice;
