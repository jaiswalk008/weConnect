import { ChatType, User } from '@prisma/client';
import friendRepository from '../repository/friend.repository';
import userRepository from '../repository/user.repository';
import { ConflictError, NotFoundError } from '../utils/errors';
import chatService from './chat.service';
import userService from './user.service';

class FriendService {
  async findFriends(userId: number) {
    const friends = await friendRepository.findFriends(
      { user_id: userId },
      {
        user: true,
        friend_user: true,
      }
    );
    const onlineFriendsData = friends.filter(friend => {
      return friend.friend_user.status === 'online' && friend.status === 'ACCEPTED';
    });
    const onlineFriends = onlineFriendsData.map(friend => {
      return {
        ...userService.getUserProfile(friend.friend_user),
      };
    });
    const offlineFriendsData = friends.filter(friend => {
      return friend.friend_user.status !== 'online' && friend.status === 'ACCEPTED';
    });
    const offlineFriends = offlineFriendsData.map(friend => {
      return {
        ...userService.getUserProfile(friend.friend_user),
      };
    });
    const pendingFriendsData = friends.filter(friend => {
      return friend.status === 'SENT';
    });
    const pendingFriends = pendingFriendsData.map(friend => {
      return {
        ...userService.getUserProfile(friend.friend_user),
      };
    });
    const requestFriendsData = friends.filter(friend => {
      return friend.status === 'RECEIVED';
    });
    const requestFriends = requestFriendsData.map(friend => {
      return {
        ...userService.getUserProfile(friend.friend_user),
      };
    });
    return { onlineFriends, offlineFriends, pendingFriends, requestFriends };
  }

  private async getFriendUser(friendUsername: string) {
    const friendUser = await userRepository.getUser({ username: friendUsername });
    if (!friendUser) {
      throw new NotFoundError('Friend user not found');
    }
    return friendUser;
  }

  private async getFriendshipStatus(userId: number, friendUserId: number) {
    const [status] = await friendRepository.findFriends({
      user_id: userId,
      friend_user_id: friendUserId,
    });
    return status;
  }

  private async createFriendRequest(userId: number, friendUserId: number) {
    await Promise.all([
      friendRepository.createFriend({
        user: { connect: { id: userId } },
        friend_user: { connect: { id: friendUserId } },
        status: 'SENT',
      }),
      friendRepository.createFriend({
        user: { connect: { id: friendUserId } },
        friend_user: { connect: { id: userId } },
        status: 'RECEIVED',
      }),
    ]);
  }

  private async updateFriendshipStatuses(user: User, friendUser: User, status: 'ACCEPTED') {
    await Promise.all([
      friendRepository.updateFriendshipStatus(
        { user_id_friend_user_id: { user_id: user.id, friend_user_id: friendUser.id } },
        { status }
      ),
      friendRepository.updateFriendshipStatus(
        { user_id_friend_user_id: { user_id: friendUser.id, friend_user_id: user.id } },
        { status }
      ),
    ]);
    await chatService.createChat(
      `${user.username}-${friendUser.username}`,
      '',
      [user.id, friendUser.id],
      ChatType.PERSONAL,
      user.id
    );
  }

  private async deleteFriendship(userId: number, friendUserId: number) {
    await Promise.all([
      friendRepository.deleteFriend({
        user_id_friend_user_id: { user_id: userId, friend_user_id: friendUserId },
      }),
      friendRepository.deleteFriend({
        user_id_friend_user_id: { user_id: friendUserId, friend_user_id: userId },
      }),
    ]);
  }

  async updateFriendshipStatus(user: User, friendUsername: string, type: string) {
    const friendUser = await this.getFriendUser(friendUsername);
    const friendshipStatus = await this.getFriendshipStatus(user.id, friendUser.id);

    switch (type) {
      case 'ADD':
        if (!friendshipStatus) {
          await this.createFriendRequest(user.id, friendUser.id);
          break;
        }
        throw new ConflictError('Friend request already sent');

      case 'ACCEPT':
        if (!friendshipStatus) {
          throw new NotFoundError('Friend request not found');
        }
        if (friendshipStatus.status === 'ACCEPTED') {
          throw new ConflictError('Friend request already accepted');
        }
        if (friendshipStatus.status !== 'RECEIVED') {
          throw new NotFoundError('Friend request not received');
        }
        await this.updateFriendshipStatuses(user, friendUser, 'ACCEPTED');
        break;
      case 'CANCEL':
        if (!friendshipStatus || friendshipStatus.status !== 'SENT') {
          throw new NotFoundError('Friend request not sent');
        }
        await this.deleteFriendship(user.id, friendUser.id);
        break;
      case 'REJECT':
        if (!friendshipStatus || friendshipStatus.status !== 'RECEIVED') {
          throw new NotFoundError('Friend request not received');
        }
        await this.deleteFriendship(user.id, friendUser.id);
        break;

      case 'REMOVE':
        if (!friendshipStatus || friendshipStatus.status !== 'ACCEPTED') {
          throw new ConflictError('Friend request not accepted');
        }
        await this.deleteFriendship(user.id, friendUser.id);
        break;

      default:
        throw new Error('Invalid operation type');
    }
    return this.findFriends(user.id);
  }
}

export default new FriendService();
