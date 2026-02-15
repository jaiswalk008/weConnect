import type { ChatListData } from './socket';

export interface ChatResponse {
  chats: ChatListData[];
  status: string;
  message: string;
}

export interface ChatDetailsResponse {
  id: number;
  chatId?: number;
  name: string | null;
  description: string | null;
  image: string | null;
  type: string;
  createdAt: string;
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
    last_seen: string | null;
    role: string;
    joinedAt: string;
  }>;
}
