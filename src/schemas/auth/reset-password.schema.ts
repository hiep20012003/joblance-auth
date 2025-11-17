import {z} from 'zod';

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Confirm password is required')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
