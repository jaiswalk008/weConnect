import ProfileImage from '../Profile/ProfileImage';
import { CallParticipant } from '@/context/CallContext';

const MAX_VISIBLE_AVATARS = 4;

export const ParticipantAvatars = ({ participants }: { participants: CallParticipant[] }) => {
  if (participants.length === 0) return null;

  const visible = participants.slice(0, MAX_VISIBLE_AVATARS);
  const remaining = participants.length - MAX_VISIBLE_AVATARS;

  return (
    <div className='flex items-center justify-center -space-x-3'>
      {visible.map((p) => (
        <div key={p.id} className='relative' title={p.name}>
          <div className='ring-2 ring-background rounded-full'>
            <ProfileImage size='small' image={p.profileImage || ''} chatName={p.name} />
          </div>
          {/* Green dot for active */}
          <div className='absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background' />
        </div>
      ))}
      {remaining > 0 && (
        <div className='w-9 h-9 rounded-full bg-secondary border-2 border-background flex items-center justify-center'>
          <span className='text-xs font-semibold text-foreground'>+{remaining}</span>
        </div>
      )}
    </div>
  );
};
