import z from 'zod';

// Schema for user registration
export const signUpSchema = z.object({
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .max(30, { message: 'Username must not exceed 30 characters' }),

  email: z.email('Invalid email address'),

  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters long' }),

  full_name: z.string()
    .max(100, { message: 'Full name must not exceed 100 characters' })
    .optional(),

  phone: z.string()
    .regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number format')
    .optional(),

  gender: z.enum(['male', 'female', 'other'])
    .describe('Gender is required')
    .optional(),

  dob: z.coerce.date().optional(), // Accepts strings or Date
});

// Schema for user login
export const signInSchema = z.object({
  email: z.email('Invalid email address'),

  password: z.string()
    .min(1, 'Password is required'),
});

// Schema for requesting password reset
export const requestPasswordResetSchema = z.object({
  email: z.email('Invalid email address'),
});

// Schema for resetting password with a token
export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Reset token is required'),

  new_password: z.string()
    .min(6, 'New password must be at least 6 characters long'),
});

// Schema for verifying email with a token
export const verifyEmailSchema = z.object({
  token: z.string()
    .min(1, 'Verification token is required'),
});

// Common reusable validators
export const emailField = z.email('Invalid email');
export const passwordField = z.string().min(6, 'Password too short');


