import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axiosInstance';
import { useFetch } from '@/hooks/useFetch';
import { UserSearchCard } from './UserSearchCard';
import type { SearchUsersResponse, FriendshipStatus, SearchUser } from '@/types/friend';
import { useDispatch } from 'react-redux';
import { friendActions } from '@/context/store';
import { friendsAPI } from '@/api/friend';
import { FRIENDS_UPDATE_STATUS_TYPE } from '@/constants/friend';
import type { ChatDetails } from '../chatWindow/ChatWindow';

const SearchUserComponent = ({
  handleChatSelect,
}: {
  handleChatSelect: (_chat: ChatDetails) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const dispatch = useDispatch();
  const { data, loading, error, fetchData, reset } = useFetch<SearchUsersResponse>();

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.toLowerCase());
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch users when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 3) {
      fetchData(`${friendsAPI.searchUser}${encodeURIComponent(debouncedQuery)}`);
    } else if (debouncedQuery.trim().length === 0) {
      reset();
    }
  }, [debouncedQuery, fetchData, reset]);

  const handleAction = useCallback(
    async (username: string, status: FriendshipStatus) => {
      try {
        setActionLoading(username);

        let type: string;
        let successMessage: string;
        switch (status) {
          case FRIENDS_UPDATE_STATUS_TYPE.ACCEPTED:
            // Open message - implement your message logic
            setActionLoading(null);
            return;

          case FRIENDS_UPDATE_STATUS_TYPE.SENT:
            type = FRIENDS_UPDATE_STATUS_TYPE.CANCEL;
            successMessage = 'Friend request cancelled';
            break;

          case FRIENDS_UPDATE_STATUS_TYPE.RECEIVED:
            type = FRIENDS_UPDATE_STATUS_TYPE.ACCEPT;
            successMessage = 'Friend request accepted';
            break;

          case FRIENDS_UPDATE_STATUS_TYPE.NOT_FRIEND:
            type = FRIENDS_UPDATE_STATUS_TYPE.ADD;
            successMessage = 'Friend request sent';
            break;
          // case 'REJECT':
          //   type = 'REJECT';
          //   successMessage = 'Friend request rejected';
          //   break;
          default:
            return;
        }

        const response = await axiosInstance.post(friendsAPI.updateFriendship, {
          username,
          type,
        });

        toast.success(successMessage);
        dispatch(friendActions.setFriends(response.data.friends));
        // Refresh search results
        if (debouncedQuery.trim().length >= 3) {
          await fetchData(`${friendsAPI.searchUser}${encodeURIComponent(debouncedQuery)}`);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to perform action');
      } finally {
        setActionLoading(null);
      }
    },
    [debouncedQuery, fetchData, dispatch]
  );

  const isValidQuery = searchQuery.trim().length >= 3;
  const showValidationMessage = searchQuery.trim().length > 0 && !isValidQuery;
  const users = data?.users || [];
  const showResults = isValidQuery && !loading;
  const showNoResults = showResults && users.length === 0;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search users by name or username..."
            className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {/* Validation Message */}
        {showValidationMessage && (
          <Card className="p-4 bg-muted/50 border-muted">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <p>Please enter at least 3 characters to search</p>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="p-8 bg-destructive/10 border-destructive/20">
            <div className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">{error}</p>
            </div>
          </Card>
        )}

        {/* No Results */}
        {showNoResults && (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              No users found for "{debouncedQuery}"
            </p>
          </Card>
        )}

        {/* Search Results */}
        {showResults && users.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Found {users.length} {users.length === 1 ? 'user' : 'users'}
            </p>
            <div className="flex flex-col gap-3">
              {users.map((user: SearchUser) => (
                <UserSearchCard
                  key={user.username}
                  user={user}
                  isLoading={actionLoading === user.username}
                  onAction={handleAction}
                  handleChatSelect={handleChatSelect}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchUserComponent;
