import { MessageData } from "./chat";
export interface ChatHistoryResponse {
  messages: MessageData[];
  nextCursor: number | null;
}
