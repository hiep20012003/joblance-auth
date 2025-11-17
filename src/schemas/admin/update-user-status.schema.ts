import { z } from 'zod';

export const updateUserStatusSchema = z.object({
  status: z.preprocess(
    (val) => (typeof val === 'string' ? val.toUpperCase() : val),
    z.enum(['ACTIVE', 'INACTIVE', 'BANNED'], {
      message: 'Invalid user status. Must be ACTIVE, INACTIVE, or BANNED.'
    })
  )
});

export type UpdateUserStatusDTO = z.infer<typeof updateUserStatusSchema>;
