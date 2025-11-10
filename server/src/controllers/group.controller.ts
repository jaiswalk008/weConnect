import { User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import groupService from '../services/group.service';
class GroupController {
  static async createGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const {
        groupName,
        description = '',
        users,
      }: { groupName: string; description: string; users: string[] } = req.body;
      if (!user.id || !groupName || !users) {
        throw new Error('User ID, name, description and invite link are required');
      }

      const group = await groupService.createGroup(user, groupName, description, users);
      res.status(201).json({
        success: true,
        group,
        message: 'Group created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
export default GroupController;
