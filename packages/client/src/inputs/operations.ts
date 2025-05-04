import { z } from 'zod';
export const readProgressSchema = z.object({ traceId: z.string() });
export const startReleaseSchema = z.object({
  releaseName: z.string(),
  projectId: z.string().uuid(),
  projectName: z.string(),
  channel: z.enum(['dev', 'preview']).default('dev'),
  tarLocation: z.string(),
  runtimeConfig: z.string(),
  port: z.number().optional(),
  protocol: z.enum(['https', 'tcp']).optional(),
  image: z.string(),
  volumes: z.array(z.string()).optional(),
  serviceName: z.unknown().optional(),
  environment: z.unknown().optional(),
});
export const restartReleaseSchema = z.object({
  projectId: z.string().uuid().optional(),
  projectName: z.string().optional(),
  channel: z.enum(['dev', 'preview']).default('dev'),
  releaseName: z.string(),
  jwt: z.string(),
});
export const restartChannelSchema = z.object({
  projectId: z.string().uuid().optional(),
  projectName: z.string().optional(),
  channel: z.enum(['dev', 'preview']).default('dev'),
  jwt: z.string(),
});
export const deleteReleaseSchema = z.object({
  projectId: z.string().uuid().optional(),
  channel: z.enum(['dev', 'preview']).default('dev'),
  releaseName: z.string(),
});
export const restoreReleaseSchema = z.object({
  projectId: z.string().uuid().optional(),
  channel: z.enum(['dev', 'preview']).default('dev'),
  releaseName: z.string(),
});
