export * from './data-source.ts';
export * from './execute.ts';
export * from './pagination.ts';
export * from './stream.ts';
import { z } from 'zod';

export const env = {
  CONNECTION_STRING: z.string(),
  ORM_ENTITY_PREFIX: z.string().optional(),
  ORM_MIGRATIONS_RUN: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  ORM_SYNCHRONIZE: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  ORM_LOGGING: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
};
