import { z } from 'zod';

export const updateFriendSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(100),
    type: z.enum(['ADD', 'ACCEPT', 'REMOVE', 'REJECT', 'CANCEL']),
  }),
});
export type UpdateFriendInput = z.infer<typeof updateFriendSchema>['body'];
