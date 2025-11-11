import { Request, Response, NextFunction } from 'express';
import { ChatType, User } from '@prisma/client';
import { ValidationError } from '../utils/errors';
import chatService from '../services/chat.service';
class ChatController {
  static async createChat(req: Request, res: Response, next: NextFunction) {
    try {
      const { chatName, chatImage, participants } = req.body;
      const user = req.user as User;
      if (!user.id) {
        throw new ValidationError('User ID is required');
      }
      if (!chatName || participants.length === 0 || !Array.isArray(participants)) {
        throw new Error('Invalid request data');
      }
      await chatService.createChat(chatName, chatImage, participants, ChatType.PERSONAL, user.id);
      res.status(201).json({
        success: true,
        message: 'Chat created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getChatList(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      if (!user.id) {
        throw new ValidationError('User ID is required');
      }
      const chats = await chatService.getUserChatHistoryList(user.id);
      res.status(200).json({
        success: true,
        chats,
        message: 'Chats fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getChatHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      if (!user.id) {
        throw new ValidationError('User ID is required');
      }
      const { chatId } = req.query as { chatId: string };
      const chatHistory = await chatService.getChatHistory(parseInt(chatId), user.id);
      res.status(200).json({
        success: true,
        chatHistory,
        message: 'Chat history fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ChatController;
