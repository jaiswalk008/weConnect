import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import friendService from '../services/friend.service';
class FriendController {
  static async findFriends(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const friends = await friendService.findFriends(userId);
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
      const userId = req.userId;
      const { username, type } = req.body;
      if (!userId || !username || !type) {
        throw new ValidationError('User ID, username and type are required');
      }

      const friends = await friendService.updateFriendshipStatus(userId, username, type);
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
