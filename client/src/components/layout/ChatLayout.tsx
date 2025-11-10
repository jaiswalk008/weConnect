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
import type { ChatListData } from '@/types/socket';
import type { NotificationData } from '@/types/notification';
import { useDispatch, useSelector } from 'react-redux';
import { chatActions, type RootState } from '@/context/store';
import { chatAPI } from '@/api/chat';
import { TABS } from '@/constants/tabs';

export const ChatLayout = () => {
  const [activeTab, setActiveTab] = useState<TABS>(TABS.CHATS);
  const [selectedChat, setSelectedChat] = useState<ChatDetails>({
    chatId: 0,
    chatImage: '',
    chatName: '',
    chatType: 'PERSONAL',
  });
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showChatWindow, setShowChatWindow] = useState(false);
  const { isConnected, error } = useSocket();
  const { markAsRead } = useMessages(selectedChat.chatId);
  const { data, loading, fetchData } = useFetch<ChatResponse>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.userData);
  const chatList = useSelector((state: RootState) => state.chat.chatList);
  // Handle new message notifications
  const createUpdatedChat = useCallback(
    (chat: ChatListData, chatData: ChatListData, isSelected: boolean): ChatListData => ({
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
    (chatData: ChatListData, isSelected: boolean): ChatListData => ({
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
      chatCreatedAt: new Date(),
      createdByUser: chatData.createdByUser,
      unreadCount: isSelected ? 0 : chatData.unreadCount || 1,
    }),
    []
  );
  const handleNewGroup = useCallback(
    (notification: NotificationData) => {
      if (!notification.chatListData) return;
      console.log('new group notification', notification);
      const chatData = notification.chatListData;
      const isSelectedChat = chatData.chatId === selectedChat.chatId;
      if (isSelectedChat && chatData.lastMessage) {
        dispatch(chatActions.addMessage(chatData.lastMessage));
        markAsRead(chatData.chatId);
      }

      // Update or add chat in Redux store
      const newChat = chatList.some(chat => chat.chatId === chatData.chatId)
        ? createUpdatedChat(
            chatList.find(chat => chat.chatId === chatData.chatId)!,
            chatData,
            isSelectedChat
          )
        : createNewChat(chatData, isSelectedChat);

      dispatch(chatActions.upsertChat(newChat));
      if (notification.chatListData.createdByUser?.username === user?.username) {
        setActiveTab(TABS.CHATS);
        setSelectedChat({
          chatId: chatData.chatId,
          chatImage: chatData.chatImage || '',
          chatName: chatData.chatName || '',
          chatType: chatData.chatType as 'PERSONAL' | 'GROUP',
        });
      }
    },
    [
      selectedChat.chatId,
      createUpdatedChat,
      createNewChat,
      dispatch,
      markAsRead,
      user?.username,
      chatList,
    ]
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

      // Update or add chat in Redux store
      const newChat = chatList.some(chat => chat.chatId === chatData.chatId)
        ? createUpdatedChat(
            chatList.find(chat => chat.chatId === chatData.chatId)!,
            chatData,
            isSelectedChat
          )
        : createNewChat(chatData, isSelectedChat);

      dispatch(chatActions.upsertChat(newChat));
    },
    [selectedChat.chatId, createUpdatedChat, createNewChat, dispatch, markAsRead, chatList]
  );

  // Use notification system
  useNotifications({
    onNewMessage: handleNewMessage,
    onNewGroup: handleNewGroup,
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
      dispatch(chatActions.setChatList(data.chats));
    }
  }, [data, dispatch]);

  const handleChatSelect = async (chat: ChatDetails) => {
    setSelectedChat(chat);
    if (isMobile) {
      setShowChatWindow(true);
    }
    markAsRead(chat.chatId);

    // Reset unread count for selected chat in Redux store
    const updatedChat = chatList.find(c => c.chatId === chat.chatId);
    if (updatedChat) {
      dispatch(chatActions.updateChat({ ...updatedChat, unreadCount: 0 }));
    }
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
