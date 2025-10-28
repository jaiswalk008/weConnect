import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { AuthenticationError, ValidationError } from '../utils/errors';
import passport from 'passport';
import config from '../config/environment';
class UserController {
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name, password } = req.body;
      if (!email || !name || !password) {
        throw new ValidationError('Email and name are required');
      }

      const user = await userService.createUser({ email, name, password });
      const accessToken = userService.generateAccessToken(user.id);
      const refreshToken = userService.generateRefreshToken(user.id);
      res.status(201).json({
        status: 'success',
        accessToken,
        refreshToken,
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

      const user = await userService.login({ email, password });
      const accessToken = userService.generateAccessToken(user.id);
      const refreshToken = userService.generateRefreshToken(user.id);
      res.status(200).json({
        status: 'success',
        accessToken,
        refreshToken,
        message: 'User logged in successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const user = await userService.getUserProfile(userId);
      res.status(200).json({
        status: 'success',
        user,
        message: 'User profile fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserName(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const { username } = req.body;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const user = await userService.updateUsername(userId, username);
      res.status(200).json({
        status: 'success',
        user,
        message: 'User profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  static async updateProfileImage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const { profile_image } = req.body;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const user = await userService.updateProfileImage(userId, profile_image);
      res.status(200).json({
        status: 'success',
        user,
        message: 'User profile updated successfully',
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
      console.log(user);
      if (!user) {
        throw new AuthenticationError('Authentication failed');
      }

      const token = userService.generateAccessToken(user.id);
      const refreshToken = userService.generateRefreshToken(user.id);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        // sameSite: "",
      });

      res.redirect(`${config.frontendUrl}/auth/google/callback/?token=${token}`);
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
