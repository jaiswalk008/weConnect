import { PhoneOff, Phone, Mic, MicOff, Users, X } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useCall, CallParticipant } from '@/context/CallContext';
import ProfileImage from '../Profile/ProfileImage';

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
import { NoAnswerScreen } from './NoAnswerScreen';
import { ParticipantAvatars } from './ParticipantAvatars';
import { ParticipantsPanel } from './ParticipantsPanel';
import { AudioWave } from './AudioWave';

export const ActiveCallUI = () => {
  const {
    status,
    peerInfo,
    callType,
    isMuted,
    callDuration,
    activeParticipants,
    showParticipantsPanel,
    endCall,
    toggleMute,
    toggleParticipantsPanel,
    retryCall,
    dismissCall,
  } = useCall();

  if (status !== 'active' && status !== 'ringing' && status !== 'connecting' && status !== 'no_answer') return null;

  // No answer screen
  if (status === 'no_answer') {
    return <NoAnswerScreen />;
  }

  const statusText = {
    ringing: 'Ringing...',
    connecting: 'Connecting...',
    active: formatDuration(callDuration),
  }[status];

  return (
    <div className='fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-background via-background to-background/95 py-12'>
      {/* Participants panel */}
      {showParticipantsPanel && (
        <ParticipantsPanel
          participants={activeParticipants}
          onClose={toggleParticipantsPanel}
        />
      )}

      {/* Top section - Peer info */}
      <div className='flex flex-col items-center gap-4 mt-8'>
        <div className='relative'>
          {status === 'active' && (
            <>
              <div className='absolute -inset-2 rounded-full bg-green-500/10 animate-pulse' />
              <div className='absolute -inset-4 rounded-full bg-green-500/5 animate-pulse delay-150' />
            </>
          )}
          <div className='relative'>
            <ProfileImage
              size='large'
              image={peerInfo?.profileImage || ''}
              chatName={peerInfo?.name || 'Call'}
            />
          </div>
        </div>

        <div className='text-center'>
          <h2 className='text-2xl font-semibold text-foreground'>
            {peerInfo?.name || 'Call'}
          </h2>
          {peerInfo?.username && (
            <p className='text-sm text-muted-foreground'>@{peerInfo.username}</p>
          )}
        </div>

        <div className='text-center'>
          <p className='text-lg text-muted-foreground font-mono'>{statusText}</p>
          <p className='text-xs text-muted-foreground mt-1'>
            {callType === 'VOICE' ? 'Voice' : 'Video'} Call
          </p>
        </div>
      </div>

      {/* Participants in call */}
      {status === 'active' && activeParticipants.length > 0 && (
        <div className='flex flex-col items-center gap-2'>
          <ParticipantAvatars participants={activeParticipants} />
          <p className='text-xs text-muted-foreground'>
            {activeParticipants.length} {activeParticipants.length === 1 ? 'person' : 'people'} in call
          </p>
        </div>
      )}

      {/* Audio wave visualization */}
      <AudioWave />

      {/* Bottom section - Controls */}
      <div className='flex items-center gap-6 mb-8'>
        {/* Mute */}
        <div className='flex flex-col items-center gap-2'>
          <Button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full shadow-lg transition-all hover:scale-105 ${
              isMuted
                ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
            variant='ghost'
          >
            {isMuted ? <MicOff className='w-6 h-6' /> : <Mic className='w-6 h-6' />}
          </Button>
          <span className='text-xs text-muted-foreground'>{isMuted ? 'Unmute' : 'Mute'}</span>
        </div>

        {/* Participants */}
        <div className='flex flex-col items-center gap-2'>
          <Button
            onClick={toggleParticipantsPanel}
            className={`w-14 h-14 rounded-full shadow-lg transition-all hover:scale-105 ${
              showParticipantsPanel
                ? 'bg-primary/20 text-primary hover:bg-primary/30'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
            variant='ghost'
          >
            <div className='relative'>
              <Users className='w-6 h-6' />
              {activeParticipants.length > 0 && (
                <span className='absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center'>
                  {activeParticipants.length}
                </span>
              )}
            </div>
          </Button>
          <span className='text-xs text-muted-foreground'>People</span>
        </div>

        {/* End call */}
        <div className='flex flex-col items-center gap-2'>
          <Button
            onClick={endCall}
            className='w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105'
          >
            <PhoneOff className='w-7 h-7' />
          </Button>
          <span className='text-xs text-muted-foreground'>End</span>
        </div>
      </div>

    </div>
  );
};
