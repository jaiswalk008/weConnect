import type { RootState } from '@/context/store';
import type { MessageData } from '@/types/socket';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { formatTime } from '@/utils/dateUtils';
import { MessageStatus } from './MessageStatus';
import type { MessageStatus as MessageStatusType } from '@/types/socket';
import Linkify from 'linkify-react';

interface MessageBubbleProps {
  message: MessageData;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const userData = useSelector((state: RootState) => state.auth.userData);
  const isSender = useMemo(
    () => message.sender.username === userData?.username,
    [message, userData],
  );

  const linkifyOptions = {
    className: 'underline hover:opacity-80 transition-opacity',
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  return (
    <div className={`flex w-full ${isSender ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] md:max-w-[70%] px-3 py-2 md:px-4 rounded-2xl ${
          isSender
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-card text-card-foreground rounded-bl-sm'
        }`}
      >
        <Linkify options={linkifyOptions}>
          <p className='text-sm break-all whitespace-pre-wrap'>{message.content}</p>
        </Linkify>

        <div className='flex items-center justify-end gap-1 mt-1'>
          <span
            className={`text-xs ${
              isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'
            }`}
          >
            {formatTime(message.createdAt)}
          </span>
          {isSender && message.status && (
            <MessageStatus status={message.status as MessageStatusType} isSentByMe={isSender} />
          )}
        </div>
      </div>
    </div>
  );
};
