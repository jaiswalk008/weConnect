import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/environment';
import userRepository from '../repository/user.repository';
import { UserLoginInterface, UserSignupInterface, JwtPayload } from '../types/user';
import { AuthenticationError, ConflictError } from '../utils/errors';

class AuthService {
  private saltRounds = 10;

  async signup(data: UserSignupInterface): Promise<{ accessToken: string; refreshToken: string }> {
    const existingUser = await userRepository.getUser({ email: data.email });
    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);
    const user = await userRepository.createUser({
      ...data,
      password: hashedPassword,
      username: '',
      profile_image: '',
    });

    return this.generateTokens(user.id);
  }

  async login(data: UserLoginInterface): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await userRepository.getUser({ email: data.email });

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password!);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    return this.generateTokens(user.id);
  }

  generateTokens(userId: number): { accessToken: string; refreshToken: string } {
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    return { accessToken, refreshToken };
  }

  generateAccessToken(userId: number): string {
    const payload: JwtPayload = { userId };
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtAccessExpiresIn,
    });
  }

  generateRefreshToken(userId: number): string {
    const payload: JwtPayload = { userId };
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtRefreshExpiresIn,
    });
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch {
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch {
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = this.verifyRefreshToken(refreshToken);
    const accessToken = this.generateAccessToken(payload.userId);
    return { accessToken };
  }
}

export default new AuthService();
