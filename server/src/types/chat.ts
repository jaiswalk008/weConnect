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
