import prisma from '../config/database';
import userRepository from '../repository/user.repository';
import {
  JwtPayload,
  UserInterface,
  UserLoginInterface,
  UserSignupInterface,
  UserUpdateInterface,
} from '../types/user';
import { AuthenticationError, ConflictError, ValidationError } from '../utils/errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/environment';
import { User } from '@prisma/client';
import friendRepository from '../repository/friend.repository';
class UserService {
  private saltRounds = 10;
  async createUser(data: UserSignupInterface): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictError('User already exists');
    }
    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);
    const user = await userRepository.createUser({
      ...data,
      password: hashedPassword,
      username: '',
      profile_image: '',
    });
    return user;
  }
  generateAccessToken(userId: number) {
    const payload: JwtPayload = {
      userId,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtAccessExpiresIn,
    });
  }

  generateRefreshToken(userId: number) {
    const payload: JwtPayload = {
      userId,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtRefreshExpiresIn,
    });
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch {
      throw new AuthenticationError('Invalid refresh token');
    }
  }
  async login(data: UserLoginInterface): Promise<User> {
    const user = await userRepository.getUser({ email: data.email });

    if (!user) {
      throw new AuthenticationError('User not found');
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password!);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid password');
    }
    return user;
  }
  async getUserDetails(userId: number): Promise<UserInterface | null> {
    const user = await userRepository.getUser({ id: userId });
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    return this.getUserProfile(user);
  }

  async updateUsername(userId: number, username: string): Promise<UserInterface | null> {
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
  async updateProfileImage(userId: number, profile_image: string): Promise<UserInterface | null> {
    const user = await userRepository.getUser({ id: userId });
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    const updatedUser = await this.updateUserProfile(userId, { profile_image });

    return updatedUser;
  }

  async updateUserProfile(
    userId: number,
    data: UserUpdateInterface
  ): Promise<UserInterface | null> {
    const updatedUser = await userRepository.updateUser(userId, data);
    if (!updatedUser) {
      throw new AuthenticationError('User not found');
    }

    return this.getUserProfile(updatedUser);
  }

  getUserProfile(user: User): UserInterface {
    const userProfile = {
      name: user.name,
      email: user.email,
      profile_image: user.profile_image,
      username: user.username,
    };
    return userProfile;
  }
  async searchUser(userId: number, userInput: string): Promise<UserInterface[]> {
    let topTenUsers = [];
    if (userInput.length < 3) {
      throw new ValidationError('User input must be at least 3 characters long');
    }
    const users = await userRepository.searchUser(userId, userInput);
    const topTenPromise = users.slice(0, 10).map(async (user: User) => {
      return {
        ...user,
        friends: await friendRepository.findFriends({
          user_id: userId,
          friend_user_id: user.id,
        }),
      };
    });
    const topTen = await Promise.all(topTenPromise);
    console.log(topTen);

    topTenUsers = topTen.map(user => ({
      ...this.getUserProfile(user),
      friendShipStatus: user.friends.length > 0 ? user.friends[0].status : 'NOT_FRIEND',
    }));

    console.dir(topTenUsers, { depth: null });
    return topTenUsers;
  }
}

export default new UserService();
