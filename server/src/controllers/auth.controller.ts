import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { AuthenticationError, ValidationError } from '../utils/errors';
import passport from 'passport';
import config from '../config/environment';

class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name, password } = req.body;
      if (!email || !name || !password) {
        throw new ValidationError('Email, name and password are required');
      }

      const result = await authService.signup({ email, name, password });
      res.status(201).json({
        status: 'success',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        message: 'User created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const result = await authService.login({ email, password });
      res.status(200).json({
        status: 'success',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        message: 'User logged in successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static googleAuth(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  }

  static async googleAuthCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      if (!user) {
        throw new AuthenticationError('Authentication failed');
      }

      const result = await authService.generateTokens(user.id);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: false,
      });

      res.redirect(`${config.frontendUrl}/auth/google/callback/?token=${result.accessToken}`);
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }

      const result = await authService.refreshAccessToken(refreshToken);
      res.status(200).json({
        status: 'success',
        accessToken: result.accessToken,
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
