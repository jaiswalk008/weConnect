import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { authenticateMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

// All routes require authentication
// router.use(authenticateMiddleware);

router.get('/me', authenticateMiddleware, UserController.getUserProfile);
router.patch('/me/username', authenticateMiddleware, UserController.updateUserName);
router.patch('/me/profile-image', authenticateMiddleware, UserController.updateProfileImage);
router.get('/search', authenticateMiddleware, UserController.searchUser);
router.patch('/me/update-password', authenticateMiddleware, UserController.updatePassword);
router.patch('/me/update-profile', authenticateMiddleware, UserController.updateProfile);
export default router;
