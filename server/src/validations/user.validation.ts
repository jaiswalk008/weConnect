import { z } from 'zod';

export const updateUsernameSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(100),
  }),
});

export const updateProfileImageSchema = z.object({
  body: z.object({
    profile_image: z.string().url(),
  }),
});

export const searchUserSchema = z.object({
  query: z.object({
    userinput: z.string().min(3),
  }),
});

export type UpdateUsernameInput = z.infer<typeof updateUsernameSchema>['body'];
export type UpdateProfileImageInput = z.infer<typeof updateProfileImageSchema>['body'];
export type SearchUserInput = z.infer<typeof searchUserSchema>['query'];
