import type { MessageData } from '@/types/socket';
import { formatDayMonth } from '@/utils/dateUtils';
import ProfileImage from '../common/ProfileImage';

export interface Chat {
  id: number;
  chatName: string;
  lastMessage: MessageData;
  unreadCount?: number;
  chatImage?: string;
  chatType: 'PERSONAL' | 'GROUP';
}

export interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}

export const ChatItem = ({ chat, isSelected, onClick }: ChatItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-3 hover:bg-accent transition-colors ${
        isSelected ? 'bg-accent' : ''
      }`}
    >
      {/* Avatar */}
      <ProfileImage image={chat.chatImage || ''} chatName={chat.chatName} />
      {/* Chat Info */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-foreground truncate">{chat.chatName}</h3>
          <span className="text-xs text-muted-foreground ml-2 shrink-0">
            {formatDayMonth(chat.lastMessage.createdAt)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">{chat.lastMessage.content}</p>
          {!!chat?.unreadCount && (
            <span className="ml-2 shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
