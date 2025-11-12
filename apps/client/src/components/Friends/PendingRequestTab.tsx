// src/components/friends/PendingRequestsTab.tsx

import { Badge } from '@workspace/ui/components/badge';
import { Card } from '@workspace/ui/components/card';
import { PendingRequestCard } from './PendingRequestCard';
import type { PendingRequestsTabProps } from '@/types/friend';

export const PendingRequestsTab = ({
  requestFriends,
  actionLoading,
  onAccept,
  onReject,
}: PendingRequestsTabProps) => {
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2 mb-4'>
        <h2 className='text-lg font-semibold text-foreground'>Friend Requests</h2>
        <Badge variant='default'>{requestFriends.length}</Badge>
      </div>

      {requestFriends.length > 0 ? (
        <div className='flex flex-col gap-3'>
          {requestFriends.map((friend) => (
            <PendingRequestCard
              key={friend.username}
              friend={friend}
              isLoading={actionLoading === friend.username}
              onAccept={onAccept}
              onReject={onReject}
            />
          ))}
        </div>
      ) : (
        <Card className='p-8'>
          <p className='text-center text-muted-foreground'>No pending friend requests</p>
        </Card>
      )}
    </div>
  );
};
