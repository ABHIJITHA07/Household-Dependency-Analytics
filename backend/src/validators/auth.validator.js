import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  email: z.string({ required_error: 'Email is required' })
    .email('Invalid email address format')
    .toLowerCase()
    .trim(),
  password: z.string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long')
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' })
    .email('Invalid email address format')
    .toLowerCase()
    .trim(),
  password: z.string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'Current password is required' })
    .min(1, 'Current password is required'),
  newPassword: z.string({ required_error: 'New password is required' })
    .min(8, 'New password must be at least 8 characters long')
});
