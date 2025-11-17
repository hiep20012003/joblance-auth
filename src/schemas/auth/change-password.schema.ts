import {z} from 'zod';

export const changePasswordSchema = z
  .object({
    id: z.string().min(1),
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
    confirmNewPassword: z.string().min(1, 'Confirm new password is required')
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword']
  });

export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
