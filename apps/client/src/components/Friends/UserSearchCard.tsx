// src/components/search/UserSearchCard.tsx

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { MessageCircle, UserPlus, UserCheck, UserX, Loader2 } from 'lucide-react';
import type { FriendshipStatus, UserSearchCardProps } from '@/types/friend';
import { FRIENDS_UPDATE_STATUS_TYPE } from '@/constants/friend';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const UserSearchCard = ({
  user,
  isLoading,
  onAction,
  handleChatSelect,
}: UserSearchCardProps) => {
  const getActionButton = () => {
    const buttonClasses = 'inline-flex items-center justify-center gap-2 shrink-0 min-w-[44px]';

    switch (user.friendShipStatus) {
      case FRIENDS_UPDATE_STATUS_TYPE.ACCEPTED:
        return (
          <Button
            size='sm'
            variant='default'
            onClick={() =>
              handleChatSelect({
                chatId: user?.chatId || 0,
                chatImage: user.profile_image,
                chatName: user.name,
                chatType: 'PERSONAL',
              })
            }
            disabled={isLoading}
            className={buttonClasses}
          >
            {isLoading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <>
                <MessageCircle className='w-4 h-4 shrink-0' />
                <span className='hidden sm:inline whitespace-nowrap'>Message</span>
              </>
            )}
          </Button>
        );

      case FRIENDS_UPDATE_STATUS_TYPE.SENT:
        return (
          <Button
            size='sm'
            variant='outline'
            onClick={() =>
              onAction(user.username, FRIENDS_UPDATE_STATUS_TYPE.SENT as FriendshipStatus)
            }
            disabled={isLoading}
            className={buttonClasses}
          >
            {isLoading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <>
                <UserX className='w-4 h-4 shrink-0' />
                <span className='hidden sm:inline whitespace-nowrap'>Cancel Request</span>
              </>
            )}
          </Button>
        );

      case FRIENDS_UPDATE_STATUS_TYPE.RECEIVED:
        return (
          <Button
            size='sm'
            variant='default'
            onClick={() =>
              onAction(user.username, FRIENDS_UPDATE_STATUS_TYPE.RECEIVED as FriendshipStatus)
            }
            disabled={isLoading}
            className={buttonClasses}
          >
            {isLoading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <>
                <UserCheck className='w-4 h-4 shrink-0' />
                <span className='hidden sm:inline whitespace-nowrap'>Accept</span>
              </>
            )}
          </Button>
        );

      case FRIENDS_UPDATE_STATUS_TYPE.NOT_FRIEND:
        return (
          <Button
            size='sm'
            variant='default'
            onClick={() =>
              onAction(user.username, FRIENDS_UPDATE_STATUS_TYPE.NOT_FRIEND as FriendshipStatus)
            }
            disabled={isLoading}
            className={buttonClasses}
          >
            {isLoading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <>
                <UserPlus className='w-4 h-4 shrink-0' />
                <span className='hidden sm:inline whitespace-nowrap'>Add Friend</span>
              </>
            )}
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <Card className='p-4 hover:bg-accent/50 transition-colors'>
      <div className='flex items-center gap-3'>
        <Avatar className='w-12 h-12 shrink-0'>
          <AvatarImage src={user.profile_image} alt={user.name} />
          <AvatarFallback className='bg-primary text-primary-foreground font-semibold flex items-center justify-center w-full h-full rounded-full'>
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className='flex-1 min-w-0'>
          <h3 className='font-medium text-foreground truncate'>{user.name}</h3>
          <p className='text-sm text-muted-foreground truncate'>@{user.username}</p>
        </div>

        {getActionButton()}
      </div>
    </Card>
  );
};
