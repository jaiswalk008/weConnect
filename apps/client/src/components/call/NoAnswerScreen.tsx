import { Phone, X } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import ProfileImage from '../Profile/ProfileImage';
import { useCall } from '@/context/CallContext';

export const NoAnswerScreen = () => {
  const { peerInfo, retryCall, dismissCall } = useCall();

  return (
    <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-background via-background to-background/95'>
      <div className='flex flex-col items-center gap-6 max-w-sm mx-4'>
        {/* Avatar */}
        <div className='relative'>
          <div className='absolute -inset-2 rounded-full bg-red-500/10' />
          <ProfileImage
            size='large'
            image={peerInfo?.profileImage || ''}
            chatName={peerInfo?.name || 'Call'}
          />
        </div>

        {/* Info */}
        <div className='text-center'>
          <h2 className='text-2xl font-semibold text-foreground'>{peerInfo?.name || 'Call'}</h2>
          <p className='text-muted-foreground mt-2'>No answer</p>
          <p className='text-sm text-muted-foreground mt-1'>
            The call was not answered. Would you like to try again?
          </p>
        </div>

        {/* Action buttons */}
        <div className='flex items-center gap-6 mt-4'>
          <div className='flex flex-col items-center gap-2'>
            <Button
              onClick={dismissCall}
              className='w-14 h-14 rounded-full bg-secondary text-foreground hover:bg-secondary/80 shadow-lg transition-all hover:scale-105'
              variant='ghost'
            >
              <X className='w-6 h-6' />
            </Button>
            <span className='text-xs text-muted-foreground'>Close</span>
          </div>

          <div className='flex flex-col items-center gap-2'>
            <Button
              onClick={retryCall}
              className='w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25 transition-all hover:scale-105'
            >
              <Phone className='w-7 h-7' />
            </Button>
            <span className='text-xs text-muted-foreground'>Try Again</span>
          </div>
        </div>
      </div>
    </div>
  );
};
