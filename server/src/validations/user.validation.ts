import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});
export const updatePasswordSchema = z.object({
  body: z.object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const getUserProfileSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type GetUserProfileInput = z.infer<typeof getUserProfileSchema>['params'];
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>['body'];
export type LoginUserInput = z.infer<typeof loginUserSchema>['body'];
