import userRepository from '../repository/user.repository';
import friendRepository from '../repository/friend.repository';
import { UserInterface, UserUpdateInterface } from '../types/user';
import { AuthenticationError, ConflictError, ValidationError } from '../utils/errors';
import { User } from '@prisma/client';

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
    };
  }

  async searchUser(userId: number, userInput: string): Promise<UserInterface[]> {
    if (userInput.length < 3) {
      throw new ValidationError('User input must be at least 3 characters long');
    }

    const users = await userRepository.searchUser(userId, userInput);

    const topTenPromise = users.slice(0, 10).map(async (user: User) => {
      const friends = await friendRepository.findFriends({
        user_id: userId,
        friend_user_id: user.id,
      });

      return {
        ...this.getUserProfile(user),
        friendShipStatus: friends.length > 0 ? friends[0].status : 'NOT_FRIEND',
      };
    });

    return await Promise.all(topTenPromise);
  }
}

export default new UserService();
