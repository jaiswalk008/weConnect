import { useEffect, useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { ChatList } from '@/components/chatList/ChatList';
import { ChatWindow, type ChatDetails } from '@/components/chatWindow/ChatWindow';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useSocket } from '@/context/socket-context';
import { ConnectionLoader } from '../ui/ConnectionLoader';
import { useMessages } from '@/hooks/useMessages';
import { useNotifications } from '@/hooks/useNotification';
import type { ChatResponse } from '@/types/chat';
import { useFetch } from '@/hooks/useFetch';
import type { ChatData } from '@/types/socket';
import type { NotificationData } from '@/types/notification';
import { useDispatch } from 'react-redux';
import { chatActions } from '@/context/store';
import { chatAPI } from '@/api/chat';

export const ChatLayout = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');
  const [selectedChat, setSelectedChat] = useState<ChatDetails>({
    chatId: 0,
    chatImage: '',
    chatName: '',
    chatType: 'PERSONAL',
  });
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showChatWindow, setShowChatWindow] = useState(false);
  const { isConnected, error } = useSocket();
  const [chatList, setChatList] = useState<ChatData[]>([]);
  const { markAsRead } = useMessages(selectedChat.chatId);
  const { data, loading, fetchData } = useFetch<ChatResponse>();
  const dispatch = useDispatch();
  // Handle new message notifications
  const createUpdatedChat = useCallback(
    (chat: ChatData, chatData: ChatData, isSelected: boolean): ChatData => ({
      ...chat,
      chatName: chatData.chatName || chat.chatName,
      chatImage: chatData.chatImage || chat.chatImage,
      lastMessage: chatData.lastMessage,
      createdAt: new Date(chatData.lastMessage?.createdAt),
      unreadCount: isSelected ? 0 : chatData.unreadCount || 0,
    }),
    []
  );

  const createNewChat = useCallback(
    (chatData: ChatData, isSelected: boolean): ChatData => ({
      id: chatData.chatId,
      createdAt: new Date(),
      chatId: chatData.chatId,
      chatName: chatData.chatName || '',
      chatImage: chatData.chatImage || '',
      chatType: chatData.chatType as 'PERSONAL' | 'GROUP',
      lastMessage: {
        id: chatData.lastMessage?.id,
        chatId: chatData.lastMessage?.chatId,
        content: chatData.lastMessage?.content || '',
        createdAt: chatData.lastMessage?.createdAt,
        sender: chatData.lastMessage?.sender,
      },
      unreadCount: isSelected ? 0 : chatData.unreadCount || 1,
    }),
    []
  );

  const handleNewMessage = useCallback(
    (notification: NotificationData) => {
      if (!notification.chatData) return;

      const chatData = notification.chatData;
      const isSelectedChat = chatData.chatId === selectedChat.chatId;
      if (isSelectedChat && chatData.lastMessage) {
        dispatch(chatActions.addMessage(chatData.lastMessage));
        markAsRead(chatData.chatId);
      }
      setChatList(prevList => {
        const chatIndex = prevList.findIndex(chat => chat.chatId === chatData.chatId);

        if (chatIndex !== -1) {
          // Update existing chat
          const updatedChat = createUpdatedChat(prevList[chatIndex], chatData, isSelectedChat);
          return [updatedChat, ...prevList.slice(0, chatIndex), ...prevList.slice(chatIndex + 1)];
        }

        // Add new chat
        const newChat = createNewChat(chatData, isSelectedChat);
        return [newChat, ...prevList];
      });
    },
    [selectedChat.chatId, createUpdatedChat, createNewChat, dispatch, markAsRead]
  );

  // Use notification system
  useNotifications({
    onNewMessage: handleNewMessage,
  });

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (error) {
      console.error('Socket error:', error);
    }
  }, [error]);

  useEffect(() => {
    fetchData(chatAPI.fetchChatList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data?.chats) {
      setChatList(data.chats);
    }
  }, [data]);

  const handleChatSelect = async (chat: ChatDetails) => {
    setSelectedChat(chat);
    if (isMobile) {
      setShowChatWindow(true);
    }
    markAsRead(chat.chatId);

    // Reset unread count for selected chat
    setChatList(prevList =>
      prevList.map(c => (c.chatId === chat.chatId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleBack = () => {
    setShowChatWindow(false);
    setSelectedChat({
      chatId: 0,
      chatImage: '',
      chatName: '',
      chatType: 'PERSONAL',
    });
  };

  return (
    <div className="h-screen flex overflow-hidden relative">
      <ConnectionLoader isConnected={isConnected} />

      {(!isMobile || !showChatWindow) && (
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      <ChatList
        activeTab={activeTab}
        onChatSelect={handleChatSelect}
        selectedChat={selectedChat}
        isMobile={isMobile}
        setActiveTab={setActiveTab}
        showChatList={!isMobile || !showChatWindow}
        data={chatList}
        loading={loading}
      />

      <ChatWindow
        chatDetails={selectedChat}
        isMobile={isMobile}
        showChatWindow={!isMobile || showChatWindow}
        onBack={handleBack}
        activeTab={activeTab}
      />
    </div>
  );
};
