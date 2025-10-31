import { Search, Plus } from 'lucide-react';
import { ChatItem } from './ChatItem';
import FriendsList from '../Friends';
import SearchUserComponent from '../Friends/SearchUser';
import { Input } from '../ui/input';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  avatar?: string;
}

interface ChatListProps {
  activeTab: 'chats' | 'friends';
  onChatSelect: (_chatId: string) => void;
  selectedChatId?: string;
  isMobile: boolean;
  showChatList: boolean;
  _onBack?: () => void;
}

const MOCK_CHATS: Chat[] = [
  { id: '1', name: 'John Doe', lastMessage: 'Hey, how are you?', timestamp: '10:30 AM', unread: 2 },
  { id: '2', name: 'Jane Smith', lastMessage: 'See you tomorrow!', timestamp: '9:15 AM' },
  {
    id: '3',
    name: 'Team Project',
    lastMessage: 'Meeting at 3 PM',
    timestamp: 'Yesterday',
    unread: 5,
  },
  { id: '4', name: 'Mom', lastMessage: 'Call me when you can', timestamp: 'Yesterday' },
];

export const ChatList = ({
  activeTab,
  onChatSelect,
  selectedChatId,
  isMobile,
  showChatList,
  // _onBack,
}: ChatListProps) => {
  if (isMobile && !showChatList) return null;
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
          MOCK_CHATS.map(chat => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isSelected={selectedChatId === chat.id}
              onClick={() => onChatSelect(chat.id)}
            />
          ))}
        {activeTab === 'friends' && <FriendsList />}
      </div>
    </div>
  );
};
