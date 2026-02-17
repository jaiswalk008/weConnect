import { Loader2, ChevronDown } from 'lucide-react';
import { MessageBubble } from '../MessageBubble';
import { DateDivider } from '../DateDivider';
import { getMessageDateLabel, isSameDay } from '@/utils/dateUtils';
import type { MessageData, ChatDetails } from '@/types/socket';

interface MessageListProps {
  messages: MessageData[];
  chatDetails: ChatDetails;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: () => void;
  isFetchingMore: boolean;
  newMessageCount: number;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

export const MessageList = ({
  messages,
  messagesContainerRef,
  messagesEndRef,
  handleScroll,
  isFetchingMore,
  newMessageCount,
  scrollToBottom,
}: MessageListProps) => {
  return (
    <div className='flex-1 overflow-hidden relative bg-gradient-to-b from-background to-secondary/20'>
      <div
        ref={messagesContainerRef}
        className='h-full overflow-y-auto px-3 py-4 md:px-4'
        onScroll={handleScroll}
      >
        <div className='flex flex-col gap-2 w-full max-w-full'>
          {messages?.map((message, index) => {
            // Check if we need to show a date divider
            const showDateDivider =
              index === 0 || !isSameDay(message.createdAt, messages[index - 1]?.createdAt || '');

            return (
              <div key={message.id}>
                {showDateDivider && <DateDivider label={getMessageDateLabel(message.createdAt)} />}
                <MessageBubble message={message} />
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {isFetchingMore && (
        <div className='absolute top-2 left-1/2 transform -translate-x-1/2 bg-background/80 p-1 rounded-full shadow-sm z-10'>
          <Loader2 className='w-4 h-4 animate-spin text-primary' />
        </div>
      )}

      {/* New Messages Indicator */}
      {newMessageCount > 0 && (
        <button
          onClick={() => scrollToBottom()}
          className='absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-primary/90 transition-colors z-10'
        >
          <ChevronDown className='w-4 h-4' />
          <span className='text-sm font-medium'>
            {newMessageCount} new message{newMessageCount > 1 ? 's' : ''}
          </span>
        </button>
      )}
    </div>
  );
};
