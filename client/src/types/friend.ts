// src/components/friends/types.ts

export interface Friend {
  name: string;
  email: string;
  profile_image: string;
  username: string;
  chat:{
    chatId:number
  }
}

export interface fetchFriendsResponse {
  status: string;
  friends: FriendsData;
  message: string;
}

export interface FriendsData {
  onlineFriends: Friend[];
  offlineFriends: Friend[];
  pendingFriends: Friend[];
  requestFriends: Friend[];
}
// src/components/search/types.ts

export type FriendshipStatus = 'ACCEPTED' | 'SENT' | 'RECEIVED' | 'NOT_FRIEND' | 'CANCEL';

export interface SearchUser {
  name: string;
  email: string;
  profile_image: string;
  username: string;
  friendShipStatus: FriendshipStatus;
}

export interface SearchUsersResponse {
  status: string;
  users: SearchUser[];
  message: string;
}

export type FriendshipAction = 'ACCEPT' | 'REJECT' | 'REMOVE' | 'ADD';

export interface FriendCardProps {
  friend: Friend;
  isOnline: boolean;
  isLoading: boolean;
  onSendMessage: (_friend: Friend) => void;
  onUnfriend: (_friend: Friend) => void;
}

export interface FriendListTabProps {
  onlineFriends: Friend[];
  offlineFriends: Friend[];
  actionLoading: string | null;
  onSendMessage: (_friend: Friend) => void;
  onUnfriend: (_friend: Friend) => void;
}

export interface PendingRequestsTabProps {
  requestFriends: Friend[];
  actionLoading: string | null;
  onAccept: (_username: string) => void;
  onReject: (_username: string) => void;
}
export interface UserSearchCardProps {
  user: SearchUser;
  isLoading: boolean;
  onAction: (_username: string, _status: FriendshipStatus) => void;
}
