import { ArrowLeft, Phone, Video } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import ProfileImage from '../../Profile/ProfileImage';
import ChatMenu from '../ChatMenu';
import { ChatDetails } from '@/types/socket';

interface ChatHeaderProps {
  chatDetails: ChatDetails;
  isMobile: boolean;
  onBack: () => void;
  onShowDetails: () => void;
}

export const ChatHeader = ({ chatDetails, isMobile, onBack, onShowDetails }: ChatHeaderProps) => {
  return (
    <div className='flex items-center gap-3 p-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20'>
      {isMobile && (
        <button onClick={onBack} className='mr-2 shrink-0' aria-label='Back'>
          <ArrowLeft className='w-5 h-5 text-foreground' />
        </button>
      )}

      <div
        className='flex items-center gap-3 flex-1 min-w-0 cursor-pointer p-2 rounded-md hover:bg-accent transition-colors'
        onClick={onShowDetails}
      >
        <ProfileImage size='medium' image={chatDetails.chatImage} chatName={chatDetails.chatName} />

        <div className='flex-1 min-w-0'>
          <h2 className='font-semibold text-foreground truncate'>{chatDetails.chatName}</h2>
          <p className='text-xs text-muted-foreground'>Click for info</p>
        </div>
      </div>

      <div className='flex items-center gap-1 md:gap-2 shrink-0'>
        <Button
          variant='ghost'
          className='w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors'
        >
          <Phone className='w-4 h-4 md:w-5 md:h-5 text-muted-foreground' />
        </Button>
        <Button
          variant='ghost'
          className='w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors'
        >
          <Video className='w-4 h-4 md:w-5 md:h-5 text-muted-foreground' />
        </Button>
        <ChatMenu chatId={chatDetails.chatId} />
      </div>
    </div>
  );
};
