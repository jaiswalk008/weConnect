import userRepository from '../repository/user.repository';
import friendRepository from '../repository/friend.repository';
import { UserInterface, UserUpdateInterface } from '../types/user';
import { AuthenticationError, ConflictError, ValidationError } from '../utils/errors';
import { User } from '@prisma/client';
import prisma from '../config/database';
import bcrypt from 'bcrypt';
class UserService {
  async getUserDetails(userId: number): Promise<UserInterface> {
    const user = await userRepository.getUser({ id: userId });
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    return this.getUserProfile(user);
  }

  async updateUsername(userId: number, username: string): Promise<UserInterface> {
    const user = await userRepository.getUser({ id: userId });
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const usernameExists = await userRepository.getUser({ username: username.toLowerCase() });
    if (usernameExists) {
      throw new ConflictError('Username already exists');
    }

    const updatedUser = await this.updateUserProfile(userId, { username: username.toLowerCase() });
    return updatedUser;
  }

  async updateProfileImage(userId: number, profile_image: string): Promise<UserInterface> {
    const user = await userRepository.getUser({ id: userId });
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const updatedUser = await this.updateUserProfile(userId, { profile_image });
    return updatedUser;
  }

  async updateUserProfile(userId: number, data: UserUpdateInterface): Promise<UserInterface> {
    const updatedUser = await userRepository.updateUser(userId, data);
    if (!updatedUser) {
      throw new AuthenticationError('User not found');
    }

    return this.getUserProfile(updatedUser);
  }

  getUserProfile(user: User): UserInterface {
    return {
      name: user.name,
      email: user.email,
      profile_image: user.profile_image,
      username: user.username,
      about: user.about,
    };
  }

  async searchUser(userId: number, userInput: string): Promise<UserInterface[]> {
    if (userInput.length < 3) {
      throw new ValidationError('User input must be at least 3 characters long');
    }

    const users = await userRepository.searchUser(userId, userInput);
    const topTenUsers = users.slice(0, 10);

    // If no users found, return early
    if (topTenUsers.length === 0) {
      return [];
    }

    const topTenUserIds = topTenUsers.map((user) => user.id);

    // Batch all queries together instead of individual queries per user
    const [friendsData, userChatIds, commonChats] = await Promise.all([
      // Get all friendships in one query
      friendRepository.findFriends({
        user_id: userId,
        friend_user_id: { in: topTenUserIds },
      }),

      // Get current user's chat IDs once
      prisma.chatParticipant.findMany({
        where: { user_id: userId },
        select: { chat_id: true },
      }),

      // Get all common chats for all users in one query
      prisma.chatParticipant.findMany({
        where: {
          user_id: { in: topTenUserIds },
        },
        select: {
          user_id: true,
          chat_id: true,
        },
      }),
    ]);

    // Extract chat IDs
    const userChatIdSet = new Set(userChatIds.map((chat) => chat.chat_id));

    // Create lookup maps for O(1) access
    const friendshipMap = new Map<number, string>();
    friendsData.forEach((friend) => {
      friendshipMap.set(friend.friend_user_id, friend.status);
    });

    // Create common chat map: userId -> chatId
    const commonChatMap = new Map<number, number>();
    commonChats.forEach((chat) => {
      // Only add if current user is also in this chat
      if (userChatIdSet.has(chat.chat_id)) {
        // Only set if not already set (first common chat)
        if (!commonChatMap.has(chat.user_id)) {
          commonChatMap.set(chat.user_id, chat.chat_id);
        }
      }
    });

    // Map users with O(1) lookups instead of queries
    return topTenUsers.map((user) => ({
      ...this.getUserProfile(user),
      friendShipStatus: friendshipMap.get(user.id) || 'NOT_FRIEND',
      chatId: commonChatMap.get(user.id) || null,
    }));
  }
  async updatePassword(userId: number, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);
    await userRepository.updateUser(userId, { password: hashedPassword });
  }
}

export default new UserService();
