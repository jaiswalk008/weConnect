import type { RootState } from '@/context/store';
import type { MessageData } from '@/types/socket';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { formatTime } from '@/utils/dateUtils';

interface MessageBubbleProps {
  message: MessageData;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const userData = useSelector((state: RootState) => state.auth.userData);
  const isSender = useMemo(
    () => message.sender.username === userData?.username,
    [message, userData]
  );
  return (
    <div className={`flex w-full ${isSender ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] md:max-w-[70%] px-3 py-2 md:px-4 rounded-2xl ${
          isSender
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-card text-card-foreground rounded-bl-sm'
        }`}
      >
        <p className="text-sm wrap-break whitespace-pre-wrap">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
};
