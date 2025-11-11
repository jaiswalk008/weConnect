import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { signupSchema, loginSchema } from '../validations/auth.validation';
import passport from 'passport';
import AuthController from '../controllers/auth.controller';

const router = Router();

// Authentication routes
router.post('/signup', validate(signupSchema), AuthController.signup);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);

// Google OAuth
router.get('/google', AuthController.googleAuth);
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  AuthController.googleAuthCallback
);

export default router;
