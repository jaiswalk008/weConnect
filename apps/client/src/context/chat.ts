import { MessageStatus, type MessageData, type ChatListData } from '@/types/socket';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/socket';
import type { userAuthState } from '@/types/user';

interface chatState {
  chatData: MessageData[];
  chatList: ChatListData[];
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
}

const initialState: chatState = {
  chatData: [],
  chatList: [],
  socket: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Chat list actions
    setChatList: (state, action: PayloadAction<ChatListData[]>) => {
      state.chatList = action.payload;
    },
    updateChat: (state, action: PayloadAction<ChatListData>) => {
      const chatData = action.payload;
      state.chatList = state.chatList.map((chat) =>
        chat.chatId === chatData.chatId ? chatData : chat
      );
    },
    upsertChat: (state, action: PayloadAction<ChatListData>) => {
      let chatData = action.payload;
      const existingIndex = state.chatList.findIndex((chat) => chat.chatId === chatData.chatId);
      if (existingIndex == -1) {
        // Remove existing and add to front
        const oldChatData = state.chatList.splice(existingIndex, 1);
        chatData = { ...oldChatData[0], ...chatData };
      } else {
        chatData.chatType = 'PERSONAL';
      }
      state.chatList.unshift(chatData);
    },
    // Message actions
    setChatData: (state, action: PayloadAction<MessageData[]>) => {
      state.chatData = action.payload;
    },
    addMessage: (state, action: PayloadAction<MessageData>) => {
      state.chatData.push(action.payload);
    },
    removeMessage: (state, action: PayloadAction<number>) => {
      state.chatData = state.chatData.filter((message) => message.id !== action.payload);
    },
    updateMessage: (state, action: PayloadAction<MessageData>) => {
      state.chatData = state.chatData.map((message) =>
        message.id === action.payload.id ? action.payload : message
      );
    },
    updateMessageStatus: (state, action: PayloadAction<MessageData>) => {
      state.chatData = state.chatData.map((message) =>
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
      state.chatData = state.chatData.map((message) =>
        action.payload.messageIds.includes(message.id)
          ? { ...message, status: MessageStatus.READ }
          : message
      );
    },
    clearChatData: (state) => {
      state.chatData = [];
    },
  },
});

export default chatSlice;
