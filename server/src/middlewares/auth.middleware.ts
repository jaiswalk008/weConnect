import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/environment';
import { JwtPayload } from '../types/user';
import { AppError, AuthenticationError } from '../utils/errors';
import userRepository from '../repository/user.repository';
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next(new AppError('Authentication required', 401));
    return;
  }

  try {
    const decoded = jwt.verify(token, String(config.jwtSecret)) as JwtPayload;
    const user = await userRepository.getUser({id:decoded.userId});
    if(!user){
      throw new AuthenticationError('User not found');
    }
    req.userId = user.id;
    next();
  } catch {
    next(new AuthenticationError('Invalid or expired token'));
  }
};