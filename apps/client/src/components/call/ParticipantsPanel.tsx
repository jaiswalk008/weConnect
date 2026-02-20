import { X } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { CallParticipant } from '@/context/CallContext';
import ProfileImage from '../Profile/ProfileImage';

export const ParticipantsPanel = ({
  participants,
  onClose,
}: {
  participants: CallParticipant[];
  onClose: () => void;
}) => {
  return (
    <>
      {/* Transparent backdrop — click to close */}
      <div className='absolute inset-0 z-[9]' onClick={onClose} />

      <div className='absolute right-0 top-0 h-full w-72 bg-background/95 backdrop-blur-md border-l border-border shadow-xl z-10 animate-in slide-in-from-right duration-200'>
        <div className='flex items-center justify-between p-4 border-b border-border'>
          <h3 className='font-semibold text-foreground text-sm'>
            In this call ({participants.length})
          </h3>
          <Button variant='ghost' className='w-8 h-8 rounded-full' onClick={onClose}>
            <X className='w-4 h-4' />
          </Button>
        </div>
        <div className='overflow-y-auto max-h-[calc(100%-56px)]'>
          {participants.length === 0 ? (
            <p className='text-sm text-muted-foreground p-4 text-center'>
              Waiting for participants...
            </p>
          ) : (
            participants.map((p) => (
              <div
                key={p.id}
                className='flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors'
              >
                <div className='relative'>
                  <ProfileImage size='small' image={p.profileImage || ''} chatName={p.name} />
                  <div className='absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background' />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-medium text-foreground truncate'>{p.name}</p>
                  {p.username && (
                    <p className='text-xs text-muted-foreground truncate'>@{p.username}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
