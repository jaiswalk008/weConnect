import jwt from 'jsonwebtoken';
import { CustomSocket } from '../types/socket';
import { JwtPayload } from '../types/user';
import userRepository from '../repository/user.repository';

export const socketAuthMiddleware = async (socket: CustomSocket, next: (err?: Error) => void) => {
  try {
    const token =
      socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await userRepository.getUser({ id: decoded.userId });
    // Attach user data to socket
    if (!user || !user.id) {
      return next(new Error('Authentication error: Invalid token'));
    }
    socket.data.user = user;

    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
};
