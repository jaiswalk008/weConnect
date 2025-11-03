import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  ChatData,
  CreateChatPayload,
  MessageData,
  MessageResponse,
  SendMessagePayload,
} from './chat';
import { User } from '@prisma/client';

export interface ServerToClientEvents {
  // Message events
  'message:new': (data: MessageData) => void;
  'message:delivered': (data: { messageId: number; userId: number }) => void;
  'message:read': (data: { messageId: number; userId: number }) => void;
  'message:deleted': (data: { messageId: number; chatId: number }) => void;

  // Chat events
  'chat:created': (data: ChatData) => void;
  'chat:updated': (data: ChatData) => void;
  'chat:deleted': (data: { chatId: number }) => void;

  // Typing events
  'typing:start': (data: { chatId: number; userId: number; username: string }) => void;
  'typing:stop': (data: { chatId: number; userId: number }) => void;

  // Presence events
  'user:online': (data: { userId: number; lastSeen: Date }) => void;
  'user:offline': (data: { userId: number; lastSeen: Date }) => void;

  // Friend events
  'friend:request': (data: FriendRequestData) => void;
  'friend:accepted': (data: FriendRequestData) => void;

  // Notification events
  'notification:new': (data: NotificationData) => void;

  // Error events
  error: (data: { message: string; code?: string }) => void;
}

export interface ClientToServerEvents {
  // Message events
  'message:send': (
    data: SendMessagePayload,
    callback?: (response: MessageResponse) => void
  ) => void;
  'message:markDelivered': (data: { messageId: number }) => void;
  'message:markRead': (data: { messageId: number; chatId: number }) => void;
  'message:delete': (data: { messageId: number }) => void;

  // Chat events
  'chat:join': (data: { chatId: number }) => void;
  'chat:leave': (data: { chatId: number }) => void;
  'chat:create': (data: CreateChatPayload) => void;

  // Typing events
  'typing:start': (data: { chatId: number }) => void;
  'typing:stop': (data: { chatId: number }) => void;

  // Presence events
  'user:setOnline': () => void;
  'user:setOffline': () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user: User;
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

export interface NotificationData {
  id: number;
  userId: number;
  type: string;
  content?: string;
  referenceId?: number;
  createdAt: Date;
}

// Custom Socket Type
export type CustomSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type CustomServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
