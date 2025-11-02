import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { ChatList } from '@/components/chatList/ChatList';
import { ChatWindow, type ChatDetails } from '@/components/chatWindow/ChatWindow';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useSocket } from '@/context/socket-context';
import { useDispatch } from 'react-redux';
import { ConnectionLoader } from '../ui/ConnectionLoader';

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
  const { socket, isConnected, error, socketId } = useSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      console.error('Socket error:', error);
    }

    console.log('Socket status:', {
      socketId,
      isConnected,
      error,
    });
  }, [socket, isConnected, error, socketId, dispatch]);

  const handleChatSelect = (chat: ChatDetails) => {
    if (chat.chatId !== selectedChat?.chatId) {
      setSelectedChat(chat);
      if (isMobile) {
        setShowChatWindow(true);
      }
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
      {/* Reconnection Toast - Subtle, animated */}
      <ConnectionLoader isConnected={isConnected} />

      {(!isMobile || !showChatWindow) && (
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      <ChatList
        activeTab={activeTab}
        onChatSelect={handleChatSelect}
        selectedChat={selectedChat}
        isMobile={isMobile}
        showChatList={!isMobile || !showChatWindow}
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
