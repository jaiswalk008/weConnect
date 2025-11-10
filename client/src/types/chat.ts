import type { ChatListData } from './socket';

export interface ChatResponse {
  chats: ChatListData[];
  status: string;
  message: string;
}
