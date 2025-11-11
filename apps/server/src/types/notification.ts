import { chatListData } from './chat';

// types/notification.ts
export enum NotificationType {
  NEW_MESSAGE = 'NEW_MESSAGE',
  MESSAGE_READ = 'MESSAGE_READ',
  MESSAGE_DELIVERED = 'MESSAGE_DELIVERED',
  TYPING = 'TYPING',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  NEW_GROUP = 'NEW_GROUP',
  // Add more as needed
}

export interface NotificationData {
  type: NotificationType;
  chatData?: chatListData;
  chatListData?: chatListData;
  metadata?: Record<string, any>;
}
