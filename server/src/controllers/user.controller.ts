import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { ValidationError } from '../utils/errors';
import { User } from '@prisma/client';
import { success } from 'zod';

class UserController {
  static async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req?.user as User;
      if (!user || !user.id) {
        throw new ValidationError('User is required');
      }

      const userInfo = userService.getUserProfile(user);
      res.status(200).json({
        status: 'success',
        user: userInfo,
        message: 'User profile fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserName(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const { username } = req.body;
      if (!user) {
        throw new ValidationError('User ID is required');
      }

      const userInfo = await userService.updateUsername(user.id, username);
      res.status(200).json({
        status: 'success',
        user: userInfo,
        message: 'Username updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfileImage(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const { profile_image } = req.body;
      if (!user) {
        throw new ValidationError('User ID is required');
      }

      const userInfo = await userService.updateProfileImage(user?.id, profile_image);
      res.status(200).json({
        status: 'success',
        userInfo,
        message: 'Profile image updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async searchUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const userInput = req.query.userinput as string;

      if (!user || !userInput) {
        throw new ValidationError('User ID and username are required');
      }

      const users = await userService.searchUser(user.id, userInput);
      res.status(200).json({
        status: 'success',
        users,
        message: 'Users fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  static async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const { newPassword } = req.body;
      if (!user) {
        throw new ValidationError('User ID is required');
      }

      await userService.updatePassword(user.id, newPassword);
      res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
