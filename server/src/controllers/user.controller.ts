import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { ValidationError } from '../utils/errors';

class UserController {
  static async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const user = await userService.getUserDetails(userId);
      res.status(200).json({
        status: 'success',
        user,
        message: 'User profile fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserName(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const { username } = req.body;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const user = await userService.updateUsername(userId, username);
      res.status(200).json({
        status: 'success',
        user,
        message: 'Username updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfileImage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const { profile_image } = req.body;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const user = await userService.updateProfileImage(userId, profile_image);
      res.status(200).json({
        status: 'success',
        user,
        message: 'Profile image updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async searchUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const userInput = req.query.userinput as string;

      if (!userId || !userInput) {
        throw new ValidationError('User ID and username are required');
      }

      const users = await userService.searchUser(userId, userInput);
      res.status(200).json({
        status: 'success',
        users,
        message: 'Users fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
