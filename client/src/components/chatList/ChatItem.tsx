import type { MessageData } from '@/types/socket';
import { formatDayMonth } from '@/utils/dateUtils';
import ProfileImage from '../common/ProfileImage';
import type { userAuthState } from '@/types/user';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/context/store';

export interface Chat {
  id: number;
  chatName: string;
  lastMessage: MessageData;
  unreadCount?: number;
  chatImage?: string;
  chatType: 'PERSONAL' | 'GROUP';
  createdByUser?: userAuthState;
  chatCreatedAt?: Date;
}

export interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}

export const ChatItem = ({ chat, isSelected, onClick }: ChatItemProps) => {
  const user = useSelector((state: RootState) => state.auth.userData);
  const lastMessageContent = useMemo(() => {
    if (chat?.lastMessage?.content) {
      return chat.lastMessage.content;
    } else if (chat?.lastMessage?.mediaType) {
      return 'Image';
    } else if (chat.chatType === 'GROUP') {
      return chat.createdByUser?.username === user?.username
        ? 'You created this group'
        : `${chat.createdByUser?.username} created this group`;
    }
    return '';
  }, [
    chat.chatType,
    chat.createdByUser?.username,
    chat?.lastMessage?.content,
    chat.lastMessage?.mediaType,
    user?.username,
  ]);
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
            {formatDayMonth(chat.lastMessage?.createdAt || chat.chatCreatedAt || new Date())}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">{lastMessageContent}</p>
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
