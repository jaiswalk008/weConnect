import type { NotificationData } from './notification';
import type { userAuthState } from './user';
export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connect',
  DISCONNECT: 'disconnect',

  // Messages
  MESSAGE_SEND: 'message:send',
  MESSAGE_NEW: 'message:new',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_READ: 'message:read',
  MESSAGE_MARK_DELIVERED: 'message:markDelivered',
  MESSAGE_MARK_READ: 'message:markRead',
  MESSAGE_DELETE: 'message:delete',
  MESSAGE_DELETED: 'message:deleted',

  // Chat
  CHAT_JOIN: 'chat:join',
  CHAT_LEAVE: 'chat:leave',
  CHAT_CREATE: 'chat:create',
  CHAT_CREATED: 'chat:created',
  CHAT_UPDATED: 'chat:updated',
  CHAT_DELETED: 'chat:deleted',

  // Typing
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  // Presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_SET_ONLINE: 'user:setOnline',
  USER_SET_OFFLINE: 'user:setOffline',

  // Friends
  FRIEND_REQUEST: 'friend:request',
  FRIEND_ACCEPTED: 'friend:accepted',

  // Notifications
  NOTIFICATION: 'notification',

  // Errors
  ERROR: 'error',
};
export interface ServerToClientEvents {
  [SOCKET_EVENTS.MESSAGE_NEW]: (_data: MessageData) => void;
  [SOCKET_EVENTS.MESSAGE_DELIVERED]: (_data: MessageDeliveredData) => void;
  [SOCKET_EVENTS.MESSAGE_READ]: (_data: MessageReadData) => void;
  [SOCKET_EVENTS.MESSAGE_DELETED]: (_data: MessageDeletedData) => void;
  [SOCKET_EVENTS.CHAT_CREATED]: (_data: ChatListData) => void;
  [SOCKET_EVENTS.CHAT_UPDATED]: (_data: ChatListData) => void;
  [SOCKET_EVENTS.CHAT_DELETED]: (_data: ChatDeletedData) => void;
  [SOCKET_EVENTS.TYPING_START]: (_data: TypingData) => void;
  [SOCKET_EVENTS.TYPING_STOP]: (_data: TypingStopData) => void;
  [SOCKET_EVENTS.USER_ONLINE]: (_data: UserPresenceData) => void;
  [SOCKET_EVENTS.USER_OFFLINE]: (_data: UserPresenceData) => void;
  [SOCKET_EVENTS.FRIEND_REQUEST]: (_data: FriendRequestData) => void;
  [SOCKET_EVENTS.FRIEND_ACCEPTED]: (_data: FriendRequestData) => void;
  [SOCKET_EVENTS.NOTIFICATION]: (_data: NotificationData) => void;
  [SOCKET_EVENTS.ERROR]: (_data: ErrorData) => void;
}

export interface ClientToServerEvents {
  [SOCKET_EVENTS.MESSAGE_SEND]: (
    _data: SendMessagePayload,
    _callback?: (_response: MessageResponse) => void
  ) => void;
  [SOCKET_EVENTS.MESSAGE_MARK_DELIVERED]: (_data: { messageId: number }) => void;
  [SOCKET_EVENTS.MESSAGE_MARK_READ]: (_data: { messageId: number; chatId: number }) => void;
  [SOCKET_EVENTS.CHAT_JOIN]: (_data: { chatId: number }) => void;
  [SOCKET_EVENTS.CHAT_LEAVE]: (_data: { chatId: number }) => void;
  [SOCKET_EVENTS.TYPING_START]: (_data: { chatId: number }) => void;
  [SOCKET_EVENTS.TYPING_STOP]: (_data: { chatId: number }) => void;
  [SOCKET_EVENTS.USER_SET_ONLINE]: () => void;
  [SOCKET_EVENTS.USER_SET_OFFLINE]: () => void;
}

// Data Types
export enum MessageStatus {
  'DELIVERED' = 'DELIVERED',
  'READ' = 'READ',
  'SENT' = 'SENT',
}
export interface MessageData {
  id: number;
  chatId: number;
  content?: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: string;
  sender: userAuthState;
  status?: MessageStatus;
}
export interface ChatHistoryResponse {
  chatHistory: MessageData[];
  success: boolean;
  message: string;
}

export interface ChatListData {
  id: number;
  chatId: number;
  chatType: 'PERSONAL' | 'GROUP';
  chatName: string;
  chatImage?: string;
  unreadCount?: number;
  participants?: Array<{
    role: string;
    user: userAuthState;
  }>;
  lastMessage: MessageData;
  createdAt: Date;
  createdByUser?: userAuthState;
  chatCreatedAt?: Date;
}

export interface SendMessagePayload {
  chatId: number;
  content?: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface MessageResponse {
  success: boolean;
  message?: MessageData;
  error?: string;
}

export interface MessageDeliveredData {
  messageId: number;
  userId: number;
}

export interface MessageReadData {
  messageIds: number[];
  user: userAuthState;
  chatId: number;
  timestamp: Date;
}

export interface MessageDeletedData {
  messageIds: number[];
  chatId: number;
}

export interface ChatDeletedData {
  chatId: number;
}

export interface TypingData {
  chatId: number;
  userId: number;
  username: string;
}

export interface TypingStopData {
  chatId: number;
  userId: number;
}

export interface UserPresenceData {
  userId: number;
  lastSeen: Date;
}

export interface FriendRequestData {
  id: number;
  userId: number;
  friendUserId: number;
  status: string;
  user: {
    id: number;
    username: string;
    name: string;
    profileImage?: string;
  };
}

export interface ErrorData {
  message: string;
  code?: string;
}
