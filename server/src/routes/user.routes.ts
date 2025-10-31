import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { authenticateMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
// router.use(authenticateMiddleware);

router.get('/me', authenticateMiddleware, UserController.getUserProfile);
router.patch('/me/username', authenticateMiddleware, UserController.updateUserName);
router.patch('/me/profile-image', authenticateMiddleware, UserController.updateProfileImage);
router.get('/search', authenticateMiddleware, UserController.searchUser);

export default router;
