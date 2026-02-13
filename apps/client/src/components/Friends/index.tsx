import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Badge } from '@workspace/ui/components/badge';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axiosInstance';
import { FriendListTab } from './FriendListTab';
import { PendingRequestsTab } from './PendingRequestTab';
import type { fetchFriendsResponse, Friend, FriendshipAction } from '@/types/friend';
import { useSelector } from 'react-redux';
import type { RootState } from '@/context/store';
import { useDispatch } from 'react-redux';
import { friendActions } from '@/context/store';
import { useFetch } from '@/hooks/useFetch';
import { friendsAPI } from '@/api/friend';
import type { ChatDetails } from '../chatWindow/ChatWindow';
import { TABS } from '@/constants/tabs';

interface FriendListProps {
  onChatSelect: (_chat: ChatDetails) => void;
  setActiveTab: (_tab: TABS.CHATS | TABS.FRIENDS) => void;
}

const FriendsList = ({ onChatSelect, setActiveTab }: FriendListProps) => {
  const friends = useSelector((state: RootState) => state.friend);
  const dispatch = useDispatch();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { data, loading, fetchData } = useFetch<fetchFriendsResponse>();
  useEffect(() => {
    fetchData(friendsAPI.fetchFriends);
  }, [fetchData]); // Make sure fetchData is memoized with useCallback in useFetch

  useEffect(() => {
    if (data?.friends) {
      dispatch(friendActions.setFriends(data.friends));
    }
  }, [data?.friends, dispatch]);

  const updateFriendshipStatus = async (username: string, type: FriendshipAction) => {
    try {
      setActionLoading(username);
      const response = await axiosInstance.post(friendsAPI.updateFriendship, {
        username,
        type,
      });

      const action = type === 'ACCEPT' ? 'accepted' : type === 'REJECT' ? 'rejected' : 'removed';
      toast.success(`Friend request ${action} successfully`);

      dispatch(friendActions.setFriends(response.data.friends));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update friendship status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendMessage = (friend: Friend) => {
    onChatSelect({
      chatId: friend.chat.chatId,
      chatImage: friend.profile_image,
      chatName: friend.username,
      chatType: 'PERSONAL',
    });
    setActiveTab(TABS.CHATS);
  };

  const handleUnfriend = (friend: Friend) => {
    updateFriendshipStatus(friend.username, 'REMOVE');
  };

  const handleAcceptRequest = (username: string) => {
    updateFriendshipStatus(username, 'ACCEPT');
  };

  const handleRejectRequest = (username: string) => {
    updateFriendshipStatus(username, 'REJECT');
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='w-full max-w-4xl mx-auto p-4'>
      <Tabs defaultValue='friends' className='w-full'>
        <TabsList className='w-full rounded-full bg-muted/40 dark:bg-muted/30 p-2 mb-4 border border-border/50 h-14'>
          <TabsTrigger
            value='friends'
            className='flex w-1/2 rounded-full items-center justify-between gap-2 px-5 py-3 h-full text-muted-foreground/70 dark:text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 dark:data-[state=active]:bg-accent dark:data-[state=active]:text-accent-foreground'
          >
            <span className='text-sm font-medium'>Friends</span>
            <Badge variant='secondary' className='text-xs px-2.5 py-1'>
              {friends.onlineFriends.length + friends.offlineFriends.length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value='requests'
            className='flex w-1/2 rounded-full items-center justify-between gap-2 px-5 py-3 h-full text-muted-foreground/70 dark:text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 dark:data-[state=active]:bg-accent dark:data-[state=active]:text-accent-foreground'
          >
            <span className='text-sm font-medium'>Requests</span>
            <Badge variant='secondary' className='text-xs px-2.5 py-1'>
              {friends.requestFriends.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='friends' className='focus-visible:outline-none'>
          <FriendListTab
            onlineFriends={friends.onlineFriends}
            offlineFriends={friends.offlineFriends}
            actionLoading={actionLoading}
            onSendMessage={handleSendMessage}
            onUnfriend={handleUnfriend}
          />
        </TabsContent>

        <TabsContent value='requests' className='focus-visible:outline-none'>
          <PendingRequestsTab
            requestFriends={friends.requestFriends}
            actionLoading={actionLoading}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FriendsList;
