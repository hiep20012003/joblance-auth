// import {z} from 'zod';
import { z } from 'zod';

// Schema for user registration
export const signUpSchema = z.object({
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .max(30, { message: 'Username must not exceed 30 characters' }),

  email: z.email('Invalid email address'),

  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
  confirmPassword: z.string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

export type SignUpDTO = z.infer<typeof signUpSchema>;

// Schema for user login
export const signInSchema = z.object({
  email: z.email('Invalid email address'),

  password: z.string()
    .min(1, 'Password is required'),
});
export type SignInDTO = z.infer<typeof signInSchema>;

export const resendEmailVerificationSchema = z.object({
  email: z.email()
});

export type ResendEmailVerificationDTO = z.infer<typeof resendEmailVerificationSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});
export type VerifyEmailDTO = z.infer<typeof verifyEmailSchema>;

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

// Common reusable validators
export const emailField = z.email('Invalid email');
export const passwordField = z.string().min(6, 'Password too short');


