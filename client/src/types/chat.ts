import type { ChatData } from './socket';

export interface ChatResponse {
  chats: ChatData[];
  status: string;
  message: string;
}
