import { useRef } from 'react';
import { Smile, Paperclip, Mic, Send, Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';

interface MessageInputProps {
  messageInput: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: () => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isUploading: boolean;
}

export const MessageInput = ({
  messageInput,
  handleInputChange,
  handleKeyPress,
  handleSendMessage,
  handleFileSelect,
  isUploading,
}: MessageInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='p-3 md:p-4 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex items-center gap-1 md:gap-2'>
        <Button
          variant='ghost'
          className='w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors shrink-0'
        >
          <Smile className='w-4 h-4 md:w-5 md:h-5 text-muted-foreground' />
        </Button>
        <input type='file' ref={fileInputRef} onChange={handleFileSelect} className='hidden' />
        <Button
          variant='ghost'
          onClick={handlePaperclipClick}
          disabled={isUploading}
          className='w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors shrink-0'
        >
          {isUploading ? (
            <Loader2 className='w-4 h-4 animate-spin text-muted-foreground' />
          ) : (
            <Paperclip className='w-4 h-4 md:w-5 md:h-5 text-muted-foreground' />
          )}
        </Button>

        <Textarea
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          value={messageInput}
          placeholder='Type a message...'
          className='flex-1 min-w-0 px-3 break-all whitespace-pre-wrap md:px-4 bg-secondary rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
        />

        <button className='w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors shrink-0'>
          <Mic className='w-4 h-4 md:w-5 md:h-5 text-muted-foreground' />
        </button>
        <button
          onClick={handleSendMessage}
          className='w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity shrink-0'
        >
          <Send className='w-4 h-4 md:w-5 md:h-5' />
        </button>
      </div>
    </div>
  );
};
