import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import friendService from '../services/friend.service';
import { User } from '@prisma/client';
class FriendController {
  static async findFriends(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      if (!user.id) {
        throw new ValidationError('User ID is required');
      }

      const friends = await friendService.findFriends(user.id);
      res.status(200).json({
        status: 'success',
        friends,
        message: 'Friends fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateFriendshipStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const { username, type } = req.body;
      if (!user.id || !username || !type) {
        throw new ValidationError('User ID, username and type are required');
      }

      const friends = await friendService.updateFriendshipStatus(user, username, type);
      res.status(200).json({
        status: 'success',
        friends,
        message: 'Friendship status updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
export default FriendController;
