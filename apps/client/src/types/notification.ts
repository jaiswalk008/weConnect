import type { ChatListData } from './socket';

// types/notification.ts
export enum NotificationType {
  'NEW_MESSAGE' = 'NEW_MESSAGE',
  'MESSAGE_READ' = 'MESSAGE_READ',
  'MESSAGE_DELIVERED' = 'MESSAGE_DELIVERED',
  'TYPING' = 'TYPING',
  'FRIEND_REQUEST' = 'FRIEND_REQUEST',
  'NEW_GROUP' = 'NEW_GROUP',
  // Add more as needed
}

export interface NotificationData {
  type: NotificationType;
  chatData?: ChatListData;
  chatListData?: ChatListData;

  metadata?: Record<string, any>;
}
