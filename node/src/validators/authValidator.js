import { z } from 'zod';

export const loginSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Please enter a valid email address (e.g., user@example.com)')
      .max(191, 'Email cannot exceed 191 characters'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password cannot be empty')
      .max(128, 'Password cannot exceed 128 characters')
  })
  .strict(); // Disallows unexpected extra fields
