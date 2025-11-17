import { z } from 'zod';

export const assignRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  roleId: z.string().min(1, 'Role ID is required')
});

export type AssignRoleDTO = z.infer<typeof assignRoleSchema>;
