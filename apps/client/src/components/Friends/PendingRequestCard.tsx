// src/components/friends/PendingRequestCard.tsx

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';

import { Loader2, UserCheck, UserX } from 'lucide-react';
import type { Friend } from '@/types/friend';

interface PendingRequestCardProps {
  friend: Friend;
  isLoading: boolean;
  onAccept: (_username: string) => void;
  onReject: (_username: string) => void;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const PendingRequestCard = ({
  friend,
  isLoading,
  onAccept,
  onReject,
}: PendingRequestCardProps) => {
  return (
    <Card className='p-4'>
      <div className='flex flex-col gap-3'>
        <div className='flex items-center gap-3 flex-1 min-w-0'>
          <Avatar className='w-12 h-12 shrink-0'>
            <AvatarImage src={friend.profile_image} alt={friend.name} />
            <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
          </Avatar>

          <div className='flex-1 min-w-0'>
            <h3 className='font-medium text-foreground truncate'>{friend.name}</h3>
            <p className='text-sm text-muted-foreground truncate'>@{friend.username}</p>
          </div>
        </div>

        <div className='flex gap-2 items-stretch'>
          <Button
            size='sm'
            variant='default'
            onClick={() => onAccept(friend.username)}
            disabled={isLoading}
            className='flex-1'
          >
            {isLoading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <>
                <UserCheck className='w-4 h-4 mr-2' />
                Accept
              </>
            )}
          </Button>

          <Button
            size='sm'
            variant='outline'
            onClick={() => onReject(friend.username)}
            disabled={isLoading}
            className='flex-1'
          >
            <UserX className='w-4 h-4 mr-2' />
            Decline
          </Button>
        </div>
      </div>
    </Card>
  );
};
