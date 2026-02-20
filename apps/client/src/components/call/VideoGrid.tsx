import { useEffect, useRef } from 'react';
import type { ICameraVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';
import type { RemoteVideoUser } from '@/context/CallContext';
import ProfileImage from '../Profile/ProfileImage';

/** Plays a local camera track into a container div */
export const LocalVideoPlayer = ({
  videoTrack,
  className = '',
}: {
  videoTrack: ICameraVideoTrack;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && videoTrack) {
      videoTrack.play(containerRef.current);
    }
    return () => {
      videoTrack?.stop();
    };
  }, [videoTrack]);

  return <div ref={containerRef} className={`overflow-hidden ${className}`} />;
};

/** Plays a remote user's video track into a container div */
export const RemoteVideoPlayer = ({
  videoTrack,
  className = '',
}: {
  videoTrack: IRemoteVideoTrack;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && videoTrack) {
      videoTrack.play(containerRef.current);
    }
    return () => {
      videoTrack?.stop();
    };
  }, [videoTrack]);

  return <div ref={containerRef} className={`overflow-hidden ${className}`} />;
};

/** Avatar placeholder when camera is off */
const VideoPlaceholder = ({ name, profileImage }: { name: string; profileImage?: string }) => (
  <div className='w-full h-full bg-secondary/80 flex flex-col items-center justify-center gap-3'>
    <ProfileImage size='large' image={profileImage || ''} chatName={name} />
    <p className='text-sm font-medium text-foreground'>{name}</p>
  </div>
);

/** Responsive video grid for active video calls */
export const VideoGrid = ({
  localVideoTrack,
  isVideoOff,
  remoteVideoUsers,
  localName,
  localProfileImage,
  activeParticipants,
}: {
  localVideoTrack: ICameraVideoTrack | null;
  isVideoOff: boolean;
  remoteVideoUsers: RemoteVideoUser[];
  localName: string;
  localProfileImage?: string;
  activeParticipants: { id: number; name: string; profileImage?: string }[];
}) => {
  // Determine grid layout based on remote user count
  const remoteCount = remoteVideoUsers.length;

  const gridClass =
    remoteCount === 0
      ? 'grid-cols-1 grid-rows-1'
      : remoteCount === 1
        ? 'grid-cols-1 grid-rows-1'
        : remoteCount <= 3
          ? 'grid-cols-2 grid-rows-2'
          : 'grid-cols-2 grid-rows-2';

  return (
    <div className='relative w-full h-full'>
      {/* Remote videos — fill main area */}
      <div className={`grid ${gridClass} w-full h-full gap-1`}>
        {remoteCount === 0 ? (
          /* No remote video — show local video full screen while ringing */
          <div className='w-full h-full rounded-lg overflow-hidden bg-secondary/80'>
            {localVideoTrack && !isVideoOff ? (
              <LocalVideoPlayer
                videoTrack={localVideoTrack}
                className='w-full h-full object-cover'
              />
            ) : (
              <VideoPlaceholder name={localName} profileImage={localProfileImage} />
            )}
          </div>
        ) : (
          remoteVideoUsers.map((remote) => {
            const participant = activeParticipants.find((p) => p.id === remote.uid);
            return (
              <div
                key={remote.uid}
                className='w-full h-full rounded-lg overflow-hidden bg-secondary/80'
              >
                <RemoteVideoPlayer
                  videoTrack={remote.videoTrack}
                  className='w-full h-full object-cover'
                />
                {/* Name overlay */}
                <div className='absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-xs text-white'>
                  {participant?.name || `User ${remote.uid}`}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Local video — Picture-in-Picture overlay (only when there are remote users) */}
      {remoteCount > 0 && (
        <div className='absolute bottom-4 right-4 w-32 h-44 md:w-40 md:h-56 rounded-xl overflow-hidden shadow-2xl border-2 border-background/50 z-10'>
          {localVideoTrack && !isVideoOff ? (
            <LocalVideoPlayer videoTrack={localVideoTrack} className='w-full h-full object-cover' />
          ) : (
            <VideoPlaceholder name={localName} profileImage={localProfileImage} />
          )}
        </div>
      )}
    </div>
  );
};
