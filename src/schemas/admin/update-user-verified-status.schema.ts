import { z } from 'zod';

export const updateUserVerifiedStatusSchema = z.object({
  isVerified: z.boolean({
    message: 'Verification status must be a boolean (true or false).'
  })
});

export type UpdateUserVerifiedStatusDTO = z.infer<typeof updateUserVerifiedStatusSchema>;
