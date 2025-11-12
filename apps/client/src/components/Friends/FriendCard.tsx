// src/components/friends/FriendCard.tsx

import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Loader2, MessageCircle, MoreVertical, UserMinus } from 'lucide-react';
import type { FriendCardProps } from '@/types/friend';
import ProfileImage from '../Profile/ProfileImage';

export const FriendCard = ({
  friend,
  isOnline,
  isLoading,
  onSendMessage,
  onUnfriend,
}: FriendCardProps) => {
  return (
    <Card className='p-4 hover:bg-accent/50 transition-colors'>
      <div className='flex items-center gap-3'>
        <div className='relative shrink-0'>
          <ProfileImage size='medium' image={friend.profile_image} chatName={friend.name} />
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
        </div>

        <div className='flex-1 min-w-0'>
          <h3 className='font-medium text-foreground truncate'>{friend.name}</h3>
          <p className='text-sm text-muted-foreground truncate'>@{friend.username}</p>
        </div>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              size='sm'
              variant='ghost'
              className='shrink-0 h-8 w-8 p-0 hover:bg-accent'
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <MoreVertical className='w-4 h-4' />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='w-48 bg-popover border-border shadow-lg rounded-lg p-1'
            sideOffset={8}
          >
            <DropdownMenuItem
              onClick={() => onSendMessage(friend)}
              className='flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent transition-colors'
            >
              <MessageCircle className='w-4 h-4' />
              <span className='text-sm'>Message</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUnfriend(friend)}
              className='flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive transition-colors'
            >
              <UserMinus className='w-4 h-4' />
              <span className='text-sm'>Unfriend</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
