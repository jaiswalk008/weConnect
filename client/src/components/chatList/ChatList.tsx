import { Search, Plus } from 'lucide-react';
import { ChatItem } from './ChatItem';
import FriendsList from '../Friends';
import SearchUserComponent from '../Friends/SearchUser';
import { Input } from '../ui/input';
import { useFetch } from '@/hooks/useFetch';
import { useEffect } from 'react';
import { ChatListSkeleton } from '../ui/ChatSkeletonLoader';
import type { ChatData } from '@/types/socket';
import type { ChatDetails } from '../chatWindow/ChatWindow';

// interface ChatItemProps {
//   id: number;
//   chatName: string;
//   chatImage: string;
//   lastMessage: MessageData ;
//   unreadCount: number;
//   avatar?: string;
// }
interface ChatResponse {
  chats: ChatData[];
  status: string;
  message: string;
}

interface ChatListProps {
  activeTab: 'chats' | 'friends';
  onChatSelect: (_chat: ChatDetails) => void;
  selectedChat: ChatDetails;
  isMobile: boolean;
  showChatList: boolean;
  _onBack?: () => void;
}

export const ChatList = ({
  activeTab,
  onChatSelect,
  selectedChat,
  isMobile,
  showChatList,
  // _onBack,
}: ChatListProps) => {
  const { data, loading, fetchData } = useFetch<ChatResponse>();
  useEffect(() => {
    fetchData('/api/chat/list');
  }, [fetchData]);
  if (isMobile && !showChatList) return null;
  if (loading) return <ChatListSkeleton />;
  return (
    <div className="flex flex-col h-full w-full md:w-96 bg-background border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-foreground">
            {activeTab === 'chats' ? 'Chats' : 'Friends'}
          </h1>
          <button
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
            aria-label="New chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        {activeTab === 'friends' ? (
          <SearchUserComponent />
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chats' &&
          data?.chats?.map((chat: ChatData) => (
            <ChatItem
              key={chat.chatId}
              chat={{
                id: chat.chatId,
                chatName: chat.chatName || '',
                lastMessage: chat.lastMessage,
                unreadCount: chat.unreadCount,
                chatImage: chat.chatImage,
                chatType: chat.chatType,
              }}
              isSelected={selectedChat.chatId === chat.chatId}
              onClick={() =>
                onChatSelect({
                  chatId: chat.chatId,
                  chatImage: chat.chatImage || '',
                  chatName: chat.chatName,
                  chatType: chat.chatType,
                })
              }
            />
          ))}
        {activeTab === 'friends' && <FriendsList />}
      </div>
    </div>
  );
};
