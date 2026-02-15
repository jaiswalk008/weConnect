import { Router } from 'express';
import { authenticateMiddleware } from '../middlewares/auth.middleware';
import ChatController from '../controllers/chat.controller';

const router: Router = Router();

router.post('/chat', authenticateMiddleware, ChatController.createChat);
router.get('/chat/list', authenticateMiddleware, ChatController.getChatList);
router.get('/chat/history', authenticateMiddleware, ChatController.getChatHistory);
router.get('/chat/:chatId/details', authenticateMiddleware, ChatController.getChatDetails);
export default router;
