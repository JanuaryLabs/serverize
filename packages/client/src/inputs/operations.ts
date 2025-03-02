import z from 'zod';
import * as commonZod from '../zod';
export const startReleaseSchema = z.object({
  releaseName: commonZod.orgNameValidator,
  projectId: z.string().uuid(),
  projectName: z.string().trim().min(1),
  channel: commonZod.channelSchema,
  tarLocation: z.string(),
  runtimeConfig: z.string(),
  port: z.number().optional(),
  protocol: z.enum(['https', 'tcp']).optional(),
  image: z.string().trim().min(1),
  volumes: z.array(z.string()).optional(),
  serviceName: z.any().optional(),
  environment: z.any().optional(),
  jwt: z.any(),
});
export const restartReleaseSchema = z.object({
  releaseName: commonZod.orgNameValidator,
  projectId: z.string().uuid(),
  projectName: z.string().trim().min(1),
  channel: commonZod.channelSchema,
  jwt: z.any(),
});
export const restartChannelSchema = z.object({
  channel: commonZod.channelSchema,
  projectId: z.string().uuid(),
  projectName: z.string().trim().min(1),
  jwt: z.any(),
});
export const deleteReleaseSchema = z.object({
  releaseName: commonZod.orgNameValidator,
  projectId: z.string().uuid(),
  channel: commonZod.channelSchema,
});
