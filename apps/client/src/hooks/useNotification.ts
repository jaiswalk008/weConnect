// hooks/useNotifications.ts
import { useEffect, useCallback } from 'react';
import { useSocket } from '@/context/socket-context';
import { SOCKET_EVENTS } from '@/types/socket';
import { NotificationType, type NotificationData } from '@/types/notification';

interface UseNotificationsProps {
  onNewMessage?: (_notification: NotificationData) => void;
  onMessageRead?: (_data: any) => void;
  onMessageDelivered?: (_data: any) => void;
  onNewGroup?: (_data: any) => void;
}

export const useNotifications = ({
  onNewMessage,
  onMessageRead,
  onMessageDelivered,
  onNewGroup,
}: UseNotificationsProps) => {
  const { socket } = useSocket();

  const handleNotification = useCallback(
    (notification: NotificationData) => {
      switch (notification.type) {
        case NotificationType.NEW_MESSAGE:
          onNewMessage?.(notification);

          // Show browser notification if permission granted and tab not focused
          if (
            'Notification' in window &&
            Notification.permission === 'granted' &&
            document.hidden &&
            notification.chatData
          ) {
            const { chatName, chatImage, lastMessage } = notification.chatData;

            new Notification(chatName || 'New Message', {
              body: lastMessage?.content || 'New message received',
              icon: chatImage || '/default-avatar.png',
              tag: `chat-${notification.chatData.chatId}`,
              badge: chatImage || '/default-avatar.png',
            });
          }
          break;

        case NotificationType.MESSAGE_READ:
          onMessageRead?.(notification);
          break;

        case NotificationType.MESSAGE_DELIVERED:
          onMessageDelivered?.(notification);
          break;
        case NotificationType.NEW_GROUP:
          onNewGroup?.(notification);
          break;
        default:
        // console.log('Unhandled notification type:', notification.type);
      }
    },
    [onNewMessage, onMessageRead, onMessageDelivered, onNewGroup],
  );

  useEffect(() => {
    if (!socket) return;

    socket.on(SOCKET_EVENTS.NOTIFICATION, handleNotification);
    socket.on(SOCKET_EVENTS.MESSAGE_READ, onMessageRead || (() => {}));
    socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, onMessageDelivered || (() => {}));
    socket.on(SOCKET_EVENTS.NOTIFICATION, onNewGroup || (() => {}));

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION, handleNotification);
      if (onMessageRead) socket.off(SOCKET_EVENTS.MESSAGE_READ, onMessageRead);
      if (onMessageDelivered) socket.off(SOCKET_EVENTS.MESSAGE_DELIVERED, onMessageDelivered);
      if (onNewGroup) socket.off(SOCKET_EVENTS.NOTIFICATION, onNewGroup);
    };
  }, [socket, handleNotification, onMessageRead, onMessageDelivered, onNewGroup]);
};
