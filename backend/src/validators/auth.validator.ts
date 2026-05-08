import { z } from 'zod';

// ─── Register Schema ───────────────────────────────────────────────────────────
export const RegisterSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be at most 50 characters')
    .trim()
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters'),

  lastName: z
    .string({ required_error: 'Last name is required' })
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be at most 50 characters')
    .trim()
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters'),

  username: z
    .string({ required_error: 'Username is required' })
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),

  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),

  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .regex(/^\+?[\d\s\-()]{7,15}$/, 'Please enter a valid phone number'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
});

// ─── Login Schema ──────────────────────────────────────────────────────────────
export const LoginSchema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .min(1, 'Username is required')
    .trim()
    .toLowerCase(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

// ─── Derived Types ─────────────────────────────────────────────────────────────
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput    = z.infer<typeof LoginSchema>;