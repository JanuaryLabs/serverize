import { z } from 'zod';

export * from './data-source.ts';
export * from './execute.ts';
export * from './pagination.ts';
export * from './stream.ts';

export const env = {
  CONNECTION_STRING: z.string(),
  ORM_MIGRATIONS_RUN: z.coerce.boolean().optional(),
  ORM_SYNCHRONIZE: z.coerce.boolean().optional(),
  ORM_LOGGING: z.coerce.boolean().optional(),
  ORM_ENTITY_PREFIX: z.string().optional(),
};
