import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number format').optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['driver', 'host', 'driver_host']).default('driver'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
