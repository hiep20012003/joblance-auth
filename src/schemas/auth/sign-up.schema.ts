import { z } from 'zod';

export const signUpSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .max(30, { message: 'Username must not exceed 30 characters' })
    .regex(/^\S*$/, { message: 'Username cannot contain spaces' }),

  email: z.email('Invalid email address'),
  sex: z.enum(['male', 'female', 'other'], { message: 'Gender must be required' }),
  country: z.string().min(1, { message: 'Country must be required' }),

  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(1, 'Confirm password is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export type SignUpDTO = z.infer<typeof signUpSchema>;
