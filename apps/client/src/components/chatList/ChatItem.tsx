import { MessageData } from '@/types/socket';
import { formatDayMonth } from '@/utils/dateUtils';
import ProfileImage from '../Profile/ProfileImage';
import type { userAuthState } from '@/types/user';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/context/store';
import { FileIcon, ImageIcon, VideoIcon } from 'lucide-react';

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

const getFileNameFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const pathname = urlObj.pathname;
    const segments = pathname.split('/');
    const lastSegment = segments.pop() || '';
    return decodeURIComponent(lastSegment);
  } catch (e) {
    return 'File';
  }
};

export const ChatItem = ({ chat, isSelected, onClick }: ChatItemProps) => {
  const user = useSelector((state: RootState) => state.auth.userData);

  const lastMessageContent = useMemo(() => {
    if (chat?.lastMessage?.content) {
      return chat.lastMessage.content;
    } else if (chat?.lastMessage?.mediaUrl) {
      const mediaType = chat.lastMessage.mediaType || 'OTHER';
      const fileName = getFileNameFromUrl(chat.lastMessage.mediaUrl);

      if (mediaType === 'IMAGE')
        return (
          <span className='flex items-center gap-1'>
            <ImageIcon className='w-3 h-3' /> Image
          </span>
        );
      if (mediaType === 'VIDEO')
        return (
          <span className='flex items-center gap-1'>
            <VideoIcon className='w-3 h-3' /> Video
          </span>
        );

      return (
        <span className='flex items-center gap-1'>
          <FileIcon className='w-3 h-3' /> {fileName}
        </span>
      );
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
    chat.lastMessage?.mediaUrl,
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
      <ProfileImage size='medium' image={chat.chatImage || ''} chatName={chat.chatName} />
      {/* Chat Info */}
      <div className='flex-1 min-w-0 text-left'>
        <div className='flex items-center justify-between mb-1'>
          <h3 className='font-semibold text-foreground truncate'>{chat.chatName}</h3>
          <span className='text-xs text-muted-foreground ml-2 shrink-0'>
            {formatDayMonth(chat.lastMessage?.createdAt || chat.chatCreatedAt || new Date())}
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground truncate'>{lastMessageContent}</p>
          {!!chat?.unreadCount && (
            <span className='ml-2 shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center'>
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
