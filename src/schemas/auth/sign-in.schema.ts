import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  browserName: z.string().optional().nullable(),
  deviceType: z.string().optional().nullable(),
});

export type SignInDTO = z.infer<typeof signInSchema>;
