import { z } from 'zod';

export const createRoleSchema = z
  .object({
    name: z
      .string({ required_error: 'Role name is required' })
      .trim()
      .min(1, 'Role name cannot be empty')
      .max(100, 'Role name cannot exceed 100 characters'),
    description: z.string().trim().max(255).optional(),
    permission_ids: z
      .array(
        z.number({ invalid_type_error: 'Each permission_id must be a number' }).int().positive(),
        { invalid_type_error: 'permission_ids must be an array of numbers (e.g. [1, 2, 3])' }
      )
      .optional()
  })
  .strict();

export const updateRoleSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(255).optional(),
    permission_ids: z
      .array(
        z.number({ invalid_type_error: 'Each permission_id must be a number' }).int().positive(),
        { invalid_type_error: 'permission_ids must be an array of numbers (e.g. [1, 2, 3])' }
      )
      .optional()
  })
  .strict();

export const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, 'Role ID in URL must be a valid numeric integer (e.g. /1, /2)')
  })
  .strict();
