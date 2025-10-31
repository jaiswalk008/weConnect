import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { createUserSchema, loginUserSchema } from '../validations/user.validation';
import passport from 'passport';
import UserController from '../controllers/user.controller';
import { authenticateMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/auth/google', UserController.googleAuth);
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  UserController.googleAuthCallback
);

router.post('/auth/signup', validate(createUserSchema), UserController.createUser);
router.post('/auth/login', validate(loginUserSchema), UserController.login);
router.get('/me', authenticateMiddleware, UserController.getUserProfile);
router.patch('/me/username', authenticateMiddleware, UserController.updateUserName);
router.patch('/me/profile-image', authenticateMiddleware, UserController.updateProfileImage);
router.get('/search', authenticateMiddleware, UserController.searchUser);

export default router;
