import { z } from 'zod';

export const createDashboardUserSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Please provide a valid email address')
      .max(191, 'Email cannot exceed 191 characters'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters long')
      .max(128, 'Password cannot exceed 128 characters'),
    first_name: z
      .string({ required_error: 'first_name is required' })
      .trim()
      .min(1, 'First name cannot be empty')
      .max(100, 'First name cannot exceed 100 characters'),
    last_name: z
      .string()
      .trim()
      .max(100, 'Last name cannot exceed 100 characters')
      .optional(),
    phone: z
      .string()
      .trim()
      .max(20, 'Phone cannot exceed 20 characters')
      .optional(),
    role_id: z
      .number({
        required_error: 'role_id is required',
        invalid_type_error: 'role_id must be a numeric integer (e.g. 1, 2, 3)'
      })
      .int('role_id must be an integer')
      .positive('role_id must be a valid positive role ID')
  })
  .strict(); // Blocks mass assignment / parameter injection

export const updateDashboardUserSchema = z
  .object({
    first_name: z.string().trim().min(1).max(100).optional(),
    last_name: z.string().trim().max(100).optional(),
    phone: z.string().trim().max(20).optional(),
    role_id: z
      .number({ invalid_type_error: 'role_id must be a numeric integer' })
      .int()
      .positive()
      .optional()
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    new_password: z
      .string({ required_error: 'new_password is required' })
      .min(6, 'new_password must be at least 6 characters long')
      .max(128, 'new_password cannot exceed 128 characters')
  })
  .strict();

export const statusSchema = z
  .object({
    is_active: z.boolean({
      required_error: 'is_active is required',
      invalid_type_error: 'is_active must be a boolean: true (to activate) or false (to deactivate). Do not pass strings or quotes!'
    })
  })
  .strict();

export const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, 'ID in URL must be a valid numeric integer (e.g. /1, /2)')
  })
  .strict();
