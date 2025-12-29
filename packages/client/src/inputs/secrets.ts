import { z } from 'zod';

export const createSecretSchema = z.object({
  projectId: z.string().uuid(),
  channel: z.enum(['dev', 'preview']).default('dev'),
  secretLabel: z.string(),
  secretValue: z.string(),
});
export const getSecretsSchema = z.object({
  projectId: z.string().uuid(),
  channel: z.enum(['dev', 'preview']).default('dev'),
});
export const deleteSecretSchema = z.object({ id: z.string().uuid() });
export const getSecretsValuesSchema = z.object({
  projectId: z.string().uuid(),
  channel: z.enum(['dev', 'preview']).default('dev'),
});
