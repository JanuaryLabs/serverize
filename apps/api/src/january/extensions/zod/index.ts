import validator from 'validator';
import z from 'zod';

export const orgNameValidator = z
  .string()
  .trim()
  .min(1)
  .refine((value) => validator.isAlpha(value, 'en-US', { ignore: '-' }), {
    message: 'String must contain only English letters and hyphens',
  });

export const channelSchema = z.enum(['dev', 'preview']).default('dev');
