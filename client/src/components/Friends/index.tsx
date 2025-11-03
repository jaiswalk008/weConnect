import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface FriendListProps {
  onChatSelect: (_chat: ChatDetails) => void;
  setActiveTab: (_tab: 'friends' | 'chats') => void;
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
    setActiveTab('chats');
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="w-full flex items-center mb-6">
          <TabsTrigger value="friends" className="flex w-1/2 flex-1 items-center gap-2">
            Friends
            <Badge variant="secondary" className="ml-auto">
              {friends.onlineFriends.length + friends.offlineFriends.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex w-1/2 flex-1 items-center gap-2">
            Pending Requests
            <Badge variant="secondary" className="ml-auto">
              {friends.requestFriends.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <FriendListTab
            onlineFriends={friends.onlineFriends}
            offlineFriends={friends.offlineFriends}
            actionLoading={actionLoading}
            onSendMessage={handleSendMessage}
            onUnfriend={handleUnfriend}
          />
        </TabsContent>

        <TabsContent value="requests">
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
