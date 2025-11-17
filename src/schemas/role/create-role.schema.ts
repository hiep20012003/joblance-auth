import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().trim().min(1, 'Role name is required'),
  description: z.string().trim()
});

export type CreateAndUpdateRoleDTO = z.infer<typeof createRoleSchema>;
