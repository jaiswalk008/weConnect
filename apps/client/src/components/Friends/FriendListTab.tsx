// src/components/friends/FriendListTab.tsx

import { Badge } from '@workspace/ui/components/badge';
import { Card } from '@workspace/ui/components/card';
import { FriendCard } from './FriendCard';
import type { FriendListTabProps } from '@/types/friend';

export const FriendListTab = ({
  onlineFriends,
  offlineFriends,
  actionLoading,
  onSendMessage,
  onUnfriend,
}: FriendListTabProps) => {
  return (
    <div className='space-y-6'>
      {/* Online Friends Section */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-semibold text-foreground'>Online</h2>
          <Badge variant='default'>{onlineFriends.length}</Badge>
        </div>

        {onlineFriends.length > 0 ? (
          <div className='flex flex-col gap-3'>
            {onlineFriends.map((friend) => (
              <FriendCard
                key={friend.username}
                friend={friend}
                isOnline={true}
                isLoading={actionLoading === friend.username}
                onSendMessage={onSendMessage}
                onUnfriend={onUnfriend}
              />
            ))}
          </div>
        ) : (
          <Card className='p-8'>
            <p className='text-center text-muted-foreground'>No online friends</p>
          </Card>
        )}
      </div>

      {/* Offline Friends Section */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-semibold text-foreground'>Offline</h2>
          <Badge variant='secondary'>{offlineFriends.length}</Badge>
        </div>

        {offlineFriends.length > 0 ? (
          <div className='flex flex-col gap-3'>
            {offlineFriends.map((friend) => (
              <FriendCard
                key={friend.username}
                friend={friend}
                isOnline={false}
                isLoading={actionLoading === friend.username}
                onSendMessage={onSendMessage}
                onUnfriend={onUnfriend}
              />
            ))}
          </div>
        ) : (
          <Card className='p-8'>
            <p className='text-center text-muted-foreground'>No offline friends</p>
          </Card>
        )}
      </div>
    </div>
  );
};
