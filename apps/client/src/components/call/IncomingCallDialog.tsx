import { Phone, PhoneOff } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useCall } from '@/context/CallContext';
import ProfileImage from '../Profile/ProfileImage';

export const IncomingCallDialog = () => {
  const { status, peerInfo, callType, answerCall, rejectCall } = useCall();

  if (status !== 'incoming' || !peerInfo) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
      <div className='bg-background border border-border rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-300'>
        {/* Caller Info */}
        <div className='flex flex-col items-center gap-4 mb-8'>
          {/* Pulsing ring animation */}
          <div className='relative'>
            <div className='absolute inset-0 rounded-full bg-green-500/20 animate-ping' />
            <div className='relative'>
              <ProfileImage
                size='large'
                image={peerInfo.profileImage || ''}
                chatName={peerInfo.name}
              />
            </div>
          </div>

          <div className='text-center'>
            <h3 className='text-xl font-semibold text-foreground'>{peerInfo.name}</h3>
            {peerInfo.username && (
              <p className='text-sm text-muted-foreground'>@{peerInfo.username}</p>
            )}
            <p className='text-sm text-muted-foreground mt-1'>
              Incoming {callType === 'VOICE' ? 'voice' : 'video'} call...
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className='flex justify-center gap-8'>
          <div className='flex flex-col items-center gap-2'>
            <Button
              onClick={rejectCall}
              className='w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105'
            >
              <PhoneOff className='w-6 h-6' />
            </Button>
            <span className='text-xs text-muted-foreground'>Decline</span>
          </div>

          <div className='flex flex-col items-center gap-2'>
            <Button
              onClick={answerCall}
              className='w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25 transition-all hover:scale-105 animate-pulse'
            >
              <Phone className='w-6 h-6' />
            </Button>
            <span className='text-xs text-muted-foreground'>Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
};
