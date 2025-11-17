import { z } from 'zod';

export const resendEmailVerificationSchema = z.object({
  email: z.email()
});

export type ResendEmailVerificationDTO = z.infer<typeof resendEmailVerificationSchema>;
