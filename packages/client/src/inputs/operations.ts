import z from 'zod';
export const startReleaseSchema = z.object({
  releaseName: z.string().optional(),
  projectId: z.string().uuid(),
  projectName: z.string(),
  channel: z.enum(['dev', 'preview']),
  tarLocation: z.string(),
  runtimeConfig: z.string(),
  port: z.number().optional(),
  protocol: z.enum(['https', 'tcp']).optional(),
  image: z.string(),
  volumes: z.array(z.string()).optional(),
  serviceName: z.unknown().optional(),
  environment: z.unknown().optional(),
  jwt: z.unknown(),
});
export const restartReleaseSchema = z.object({
  projectId: z.string().uuid().optional(),
  projectName: z.string().optional(),
  channel: z.enum(['dev', 'preview']),
  releaseName: z.string(),
  jwt: z.unknown(),
});
export const restartChannelSchema = z.object({
  projectId: z.string().uuid().optional(),
  projectName: z.string().optional(),
  channel: z.enum(['dev', 'preview']),
  jwt: z.unknown(),
});
export const deleteReleaseSchema = z.object({
  projectId: z.string().uuid().optional(),
  channel: z.enum(['dev', 'preview']),
  releaseName: z.string(),
});
export const restoreReleaseSchema = z.object({
  projectId: z.string().uuid().optional(),
  channel: z.enum(['dev', 'preview']),
  releaseName: z.string(),
});
