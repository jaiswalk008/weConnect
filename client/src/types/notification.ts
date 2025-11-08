import type { ChatData } from './socket';

// types/notification.ts
export enum NotificationType {
  'NEW_MESSAGE' = 'NEW_MESSAGE',
  'MESSAGE_READ' = 'MESSAGE_READ',
  'MESSAGE_DELIVERED' = 'MESSAGE_DELIVERED',
  'TYPING' = 'TYPING',
  'FRIEND_REQUEST' = 'FRIEND_REQUEST',
  // Add more as needed
}

export interface NotificationData {
  type: NotificationType;
  chatData?: ChatData;
  metadata?: Record<string, any>;
}
