import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { createUserSchema, loginUserSchema } from '../validations/user.validation';
import passport from 'passport';
import UserController from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

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
router.get('/me', authenticateToken, UserController.getUserProfile);
router.patch('/me/username', authenticateToken, UserController.updateUserName);
router.patch('/me/profile-image', authenticateToken, UserController.updateProfileImage);
// Protected routes
// router.get('/', isAuthenticated, userController.getAllUsers);
// router.post(
//   '/',
//   isAuthenticated,
//   validate(createUserSchema),
//   userController.createUser
// );

// router.get(
//   '/profile/:id',
//   isAuthenticated,
//   validate(getUserProfileSchema),
//   userController.getUserProfile
// );

// router.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect('/');
// });

export default router;
