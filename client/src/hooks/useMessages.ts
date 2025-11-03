import { useEffect } from 'react';
import { useSocket } from '@/context/socket-context'; // Import from context now
import { SOCKET_EVENTS, type MessageData } from '@/types/socket';
import { useDispatch } from 'react-redux';
import { chatActions } from '@/context/store';

export const useMessages = (chatId: number) => {
  const { socket } = useSocket(); // Get socket from context
  const dispatch = useDispatch();
  useEffect(() => {
    if (!socket || !chatId) return;

    // Join chat room
    socket.emit(SOCKET_EVENTS.CHAT_JOIN, { chatId });

    // Listen for new messages
    const handleNewMessage = (data: MessageData) => {
      if (data.chatId === chatId) {
        dispatch(chatActions.addMessage(data));
        // Mark as delivered
        // socket.emit(SOCKET_EVENTS.MESSAGE_MARK_DELIVERED, { messageId: data.id });
      }
    };

    // Subscribe to events
    socket.on(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage);

    // Cleanup on unmount or chat change
    return () => {
      socket.emit(SOCKET_EVENTS.CHAT_LEAVE, { chatId });
      socket.off(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage);
    };
  }, [socket, chatId, dispatch]);

  const sendMessage = (content: string, callback?: (response: any) => void) => {
    if (!socket) {
      console.error('Socket not connected');
      return;
    }

    socket.emit(SOCKET_EVENTS.MESSAGE_SEND, { chatId, content }, (response: any) => {
      callback?.(response);
    });
  };

  const markAsRead = (messageId: number) => {
    if (!socket) return;
    socket.emit(SOCKET_EVENTS.MESSAGE_MARK_READ, { messageId, chatId });
  };

  return { sendMessage, markAsRead };
};
