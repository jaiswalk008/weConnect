// src/components/friends/FriendCard.tsx

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, MessageCircle, MoreVertical, UserMinus } from 'lucide-react';
import type { FriendCardProps } from '@/types/friend';
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const FriendCard = ({
  friend,
  isOnline,
  isLoading,
  onSendMessage,
  onUnfriend,
}: FriendCardProps) => {
  return (
    <Card className="p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarImage src={friend.profile_image} alt={friend.name} />
            <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
          </Avatar>
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{friend.name}</h3>
          <p className="text-sm text-muted-foreground truncate">@{friend.username}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="shrink-0 h-8 w-8 p-0" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MoreVertical className="w-4 h-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onSendMessage(friend)} className="cursor-pointer">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUnfriend(friend)}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Unfriend
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
