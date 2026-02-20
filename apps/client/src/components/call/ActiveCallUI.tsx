import { PhoneOff, Mic, MicOff, Users, Video, VideoOff } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useCall } from '@/context/CallContext';
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
import { VideoGrid } from './VideoGrid';

export const ActiveCallUI = () => {
  const {
    status,
    peerInfo,
    callType,
    isMuted,
    isVideoOff,
    callDuration,
    activeParticipants,
    showParticipantsPanel,
    remoteVideoUsers,
    localVideoTrack,
    endCall,
    toggleMute,
    toggleCamera,
    toggleParticipantsPanel,
  } = useCall();

  if (
    status !== 'active' &&
    status !== 'ringing' &&
    status !== 'connecting' &&
    status !== 'no_answer'
  )
    return null;

  // No answer screen
  if (status === 'no_answer') {
    return <NoAnswerScreen />;
  }

  const statusText = {
    ringing: 'Ringing...',
    connecting: 'Connecting...',
    active: formatDuration(callDuration),
  }[status];

  const isVideoCall = callType === 'VIDEO';

  // ── Video call layout ──
  if (isVideoCall) {
    return (
      <div className='fixed inset-0 z-50 flex flex-col bg-black'>
        {/* Participants panel */}
        {showParticipantsPanel && (
          <ParticipantsPanel participants={activeParticipants} onClose={toggleParticipantsPanel} />
        )}

        {/* Video grid area */}
        <div className='flex-1 relative'>
          <VideoGrid
            localVideoTrack={localVideoTrack}
            isVideoOff={isVideoOff}
            remoteVideoUsers={remoteVideoUsers}
            localName={peerInfo?.name || 'You'}
            localProfileImage={peerInfo?.profileImage}
            activeParticipants={activeParticipants}
          />

          {/* Status overlay */}
          <div className='absolute top-4 left-1/2 -translate-x-1/2 z-20'>
            <div className='bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full'>
              <p className='text-sm text-white font-mono'>{statusText}</p>
            </div>
          </div>

          {/* Peer name overlay (visible during ringing/connecting) */}
          {status !== 'active' && (
            <div className='absolute top-16 left-1/2 -translate-x-1/2 z-20 text-center'>
              <h2 className='text-xl font-semibold text-white drop-shadow-lg'>
                {peerInfo?.name || 'Call'}
              </h2>
              <p className='text-sm text-white/70 mt-1'>
                {callType === 'VIDEO' ? 'Video' : 'Voice'} Call
              </p>
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <div className='flex items-center justify-center gap-5 py-6 bg-gradient-to-t from-black/90 to-transparent'>
          {/* Mute */}
          <div className='flex flex-col items-center gap-1.5'>
            <Button
              onClick={toggleMute}
              className={`w-13 h-13 rounded-full shadow-lg transition-all hover:scale-105 ${
                isMuted
                  ? 'bg-red-500/30 text-red-400 hover:bg-red-500/40'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              variant='ghost'
            >
              {isMuted ? <MicOff className='w-5 h-5' /> : <Mic className='w-5 h-5' />}
            </Button>
            <span className='text-[10px] text-white/60'>{isMuted ? 'Unmute' : 'Mute'}</span>
          </div>

          {/* Camera toggle */}
          <div className='flex flex-col items-center gap-1.5'>
            <Button
              onClick={toggleCamera}
              className={`w-13 h-13 rounded-full shadow-lg transition-all hover:scale-105 ${
                isVideoOff
                  ? 'bg-red-500/30 text-red-400 hover:bg-red-500/40'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              variant='ghost'
            >
              {isVideoOff ? <VideoOff className='w-5 h-5' /> : <Video className='w-5 h-5' />}
            </Button>
            <span className='text-[10px] text-white/60'>
              {isVideoOff ? 'Camera On' : 'Camera Off'}
            </span>
          </div>

          {/* Participants */}
          <div className='flex flex-col items-center gap-1.5'>
            <Button
              onClick={toggleParticipantsPanel}
              className={`w-13 h-13 rounded-full shadow-lg transition-all hover:scale-105 ${
                showParticipantsPanel
                  ? 'bg-blue-500/30 text-blue-400 hover:bg-blue-500/40'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              variant='ghost'
            >
              <div className='relative'>
                <Users className='w-5 h-5' />
                {activeParticipants.length > 0 && (
                  <span className='absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center'>
                    {activeParticipants.length}
                  </span>
                )}
              </div>
            </Button>
            <span className='text-[10px] text-white/60'>People</span>
          </div>

          {/* End call */}
          <div className='flex flex-col items-center gap-1.5'>
            <Button
              onClick={endCall}
              className='w-15 h-15 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105'
            >
              <PhoneOff className='w-6 h-6' />
            </Button>
            <span className='text-[10px] text-white/60'>End</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Voice call layout (unchanged) ──
  return (
    <div className='fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-background via-background to-background/95 py-12'>
      {/* Participants panel */}
      {showParticipantsPanel && (
        <ParticipantsPanel participants={activeParticipants} onClose={toggleParticipantsPanel} />
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
          <h2 className='text-2xl font-semibold text-foreground'>{peerInfo?.name || 'Call'}</h2>
          {peerInfo?.username && (
            <p className='text-sm text-muted-foreground'>@{peerInfo.username}</p>
          )}
        </div>

        <div className='text-center'>
          <p className='text-lg text-muted-foreground font-mono'>{statusText}</p>
          <p className='text-xs text-muted-foreground mt-1'>Voice Call</p>
        </div>
      </div>

      {/* Participants in call */}
      {status === 'active' && activeParticipants.length > 0 && (
        <div className='flex flex-col items-center gap-2'>
          <ParticipantAvatars participants={activeParticipants} />
          <p className='text-xs text-muted-foreground'>
            {activeParticipants.length} {activeParticipants.length === 1 ? 'person' : 'people'} in
            call
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
