import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ChatList } from '@/components/chatList/ChatList';
import { ChatWindow } from '@/components/chatWindow/ChatWindow';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export const ChatLayout = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');
  const [selectedChatId, setSelectedChatId] = useState<string>();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showChatWindow, setShowChatWindow] = useState(false);

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    if (isMobile) {
      setShowChatWindow(true);
    }
  };

  const handleBack = () => {
    setShowChatWindow(false);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar - Hidden on mobile when chat window is open */}
      {(!isMobile || !showChatWindow) && (
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      {/* Chat List - Hidden on mobile when chat window is open */}
      <ChatList
        activeTab={activeTab}
        onChatSelect={handleChatSelect}
        selectedChatId={selectedChatId}
        isMobile={isMobile}
        showChatList={!isMobile || !showChatWindow}
      />

      {/* Chat Window - Always visible on desktop, conditional on mobile */}
      <ChatWindow
        chatId={selectedChatId}
        isMobile={isMobile}
        showChatWindow={!isMobile || showChatWindow}
        onBack={handleBack}
        activeTab={activeTab}
      />
    </div>
  );
};
