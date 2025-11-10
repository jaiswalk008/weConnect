import { Search } from 'lucide-react';
import { ChatItem } from './ChatItem';
import FriendsList from '../Friends';
import SearchUserComponent from '../Friends/SearchUser';
import { Input } from '../ui/input';
import { ChatListSkeleton } from '../ui/ChatSkeletonLoader';
import type { ChatListData } from '@/types/socket';
import type { ChatDetails } from '../chatWindow/ChatWindow';
import ChatDropdownMenu from './Menu';
import { TABS } from '@/constants/tabs';

// interface ChatItemProps {
//   id: number;
//   chatName: string;
//   chatImage: string;
//   lastMessage: MessageData ;
//   unreadCount: number;
//   avatar?: string;
// }

interface ChatListProps {
  activeTab: TABS;
  onChatSelect: (_chat: ChatDetails) => void;
  selectedChat: ChatDetails;
  isMobile: boolean;
  showChatList: boolean;
  setActiveTab: (_tab: TABS) => void;
  data: ChatListData[];
  _onBack?: () => void;
  loading: boolean;
}

export const ChatList = ({
  activeTab,
  onChatSelect,
  selectedChat,
  isMobile,
  showChatList,
  setActiveTab,
  data,
  loading,
  // _onBack,
}: ChatListProps) => {
  if (isMobile && !showChatList) return null;
  if (loading) return <ChatListSkeleton />;
  return (
    <div className="flex flex-col h-full w-full md:w-96 bg-background border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-foreground">
            {activeTab === TABS.CHATS ? 'Chats' : 'Friends'}
          </h1>
          <ChatDropdownMenu setActiveTab={setActiveTab} />
        </div>

        {/* Search Bar */}
        {activeTab === TABS.FRIENDS ? (
          <SearchUserComponent handleChatSelect={onChatSelect} />
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
        {activeTab === TABS.CHATS &&
          data?.length > 0 &&
          data?.map((chat: ChatListData) => (
            <ChatItem
              key={chat.chatId}
              chat={{
                id: chat.chatId,
                chatName: chat.chatName || '',
                lastMessage: chat?.lastMessage,
                unreadCount: chat.unreadCount,
                chatImage: chat.chatImage,
                chatType: chat.chatType,
                createdByUser: chat.createdByUser,
                chatCreatedAt: chat.chatCreatedAt,
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
        {activeTab === TABS.FRIENDS && (
          <FriendsList onChatSelect={onChatSelect} setActiveTab={setActiveTab} />
        )}
      </div>
    </div>
  );
};
