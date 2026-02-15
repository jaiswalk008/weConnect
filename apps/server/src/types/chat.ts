import { UserInterface } from './user';
export enum MessageStatus {
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  SENT = 'SENT',
}
// Data Types
export interface MessageData {
  id: number;
  chatId: number;
  senderId: number;
  content?: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: Date;
  sender: UserInterface;
  status?: MessageStatus;
}
export const chatType = {
  PERSONAL: 'PERSONAL',
  GROUP: 'GROUP',
};
export interface chatListData {
  id: number;
  chatId: number;
  chatName?: string;
  chatImage?: string;
  chatType: string;
  lastReadMessageId?: number;
  unreadCount?: number;
  lastMessage?: MessageData;
  createdByUser: UserInterface;
  chatCreatedAt: Date;
  description?: string;
}

export interface ChatData {
  id: number;
  chatType: string;
  chatName?: string;
  chatImage?: string;
  participants: Array<{
    userId: number;
    role: string;
    user: UserInterface;
  }>;
  lastMessage?: MessageData;
  createdAt: Date;
}

export interface SendMessagePayload {
  chatId: number;
  content?: string;
  mediaUrl?: string;
  mediaType?: string;
  replyToMessageId?: number;
}

export interface CreateChatPayload {
  chatType: 'PERSONAL' | 'GROUP';
  participantIds: number[];
  chatName?: string;
  chatImage?: string;
}

export interface MessageResponse {
  success: boolean;
  message?: MessageData;
  error?: string;
}

export interface ChatDetailsResponse {
  id: number;
  chatId?: number; // Optional for backward compatibility if needed, but id is the main one
  name: string | null;
  description: string | null;
  image: string | null;
  type: string;
  createdAt: Date;
  createdBy?: {
    id: number;
    name: string;
    username: string;
    profile_image: string | null;
  };
  participants: Array<{
    id: number;
    name: string;
    username: string;
    profile_image: string | null;
    about: string | null;
    last_seen: Date | null;
    role: string;
    joinedAt: Date;
  }>;
}

export interface ChatHistoryResponse {
  messages: MessageData[];
  nextCursor: number | null;
}
