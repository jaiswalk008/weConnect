import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { ChatList } from '@/components/chatList/ChatList';
import { ChatWindow, type ChatDetails } from '@/components/chatWindow/ChatWindow';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useSocket } from '@/context/socket-context'; // Import from context
import { useDispatch } from 'react-redux';

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
  const { socket, isConnected, error, socketId } = useSocket(); // Get from context
  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      console.error('Socket error:', error);
      // Show error toast/notification
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
  console.log(isConnected);
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
          🔄 Reconnecting to server...
        </div>
      )}

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
