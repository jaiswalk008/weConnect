import { Request } from 'express';

export interface UserInterface {
  email: string;
  name: string;
  profile_image: string | null;
  username: string | null;
  about: string | null;
}

export interface UserLoginInterface {
  email: string;
  password: string;
}
export interface UserSignupInterface {
  email: string;
  name: string;
  password: string;
}
export interface AuthenticatedRequest extends Request {
  userId: number;
}
export interface JwtPayload {
  userId: number;
}
export interface UserUpdateInterface {
  username?: string;
  profile_image?: string | null;
  password?: string;
  about?: string;
}
