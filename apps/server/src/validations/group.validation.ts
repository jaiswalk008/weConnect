import { z } from 'zod';

export const createGroupSchema = z.object({
  body: z.object({
    groupName: z.string().min(3).max(100),
    description: z.string().min(0).max(100).optional(),
    users: z.array(z.string()),
    chatImage: z.string().optional(),
  }),
});
export type CreateGroupInput = z.infer<typeof createGroupSchema>['body'];
