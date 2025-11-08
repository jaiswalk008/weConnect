import { useEffect } from 'react';
import { useSocket } from '@/context/socket-context';
import { SOCKET_EVENTS, type MessageData } from '@/types/socket';
import { useDispatch, useSelector } from 'react-redux';
import { chatActions, type RootState } from '@/context/store';
import type { userAuthState } from '@/types/user';

export const useMessages = (chatId: number) => {
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.userData);
  const { chatData } = useSelector((state: RootState) => state.chat);
  useEffect(() => {
    if (!socket || !chatId) return;

    // Join chat room
    socket.emit(SOCKET_EVENTS.CHAT_JOIN, { chatId });

    const handleReadReceipt = (data: {
      messageIds: number[];
      chatId: number;
      user: userAuthState;
      timestamp: Date;
    }) => {
      if (data.chatId === chatId) {
        dispatch(chatActions.markMessagesAsRead(data));
      }
    };

    socket.on(SOCKET_EVENTS.MESSAGE_READ, handleReadReceipt);
    // Cleanup on unmount or chat change
    return () => {
      socket.emit(SOCKET_EVENTS.CHAT_LEAVE, { chatId });
      socket.off(SOCKET_EVENTS.MESSAGE_READ, handleReadReceipt);
    };
  }, [socket, chatId, dispatch, user?.username, chatData]);

  const sendMessage = (
    content: string,
    callback?: (_response: { success: boolean; message?: MessageData; error?: string }) => void
  ) => {
    if (!socket) return;

    socket.emit(
      SOCKET_EVENTS.MESSAGE_SEND,
      { chatId, content },
      (response: { success: boolean; message?: MessageData; error?: string }) => {
        console.log('Message send response:', response);
        if (response.success && response.message) {
          dispatch(chatActions.addMessage(response.message));
        }
        callback?.(response);
      }
    );
  };

  const markAsRead = (chatId: number) => {
    if (!socket) return;
    socket.emit(SOCKET_EVENTS.MESSAGE_MARK_READ, { chatId });
  };

  return { sendMessage, markAsRead };
};
