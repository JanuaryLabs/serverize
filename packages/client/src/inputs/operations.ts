import z from 'zod';
import { channelSchema, orgNameValidator } from '../zod';
export const startReleaseSchema = z.object({
  releaseName: orgNameValidator,
  projectId: z.string().uuid(),
  projectName: z.string().trim().min(1),
  channel: channelSchema,
  tarLocation: z.string(),
  runtimeConfig: z.string(),
  port: z.number().optional(),
  image: z.string().trim().min(1),
  volumes: z.array(z.string()).optional(),
  serviceName: z.any().optional(),
  environment: z.any().optional(),
  jwt: z.any(),
});
export const restartReleaseSchema = z.object({
  releaseName: orgNameValidator,
  projectId: z.string().uuid(),
  projectName: z.string().trim().min(1),
  channel: channelSchema,
  jwt: z.any(),
});
export const restartChannelSchema = z.object({
  channel: channelSchema,
  projectId: z.string().uuid(),
  projectName: z.string().trim().min(1),
  jwt: z.any(),
});
export const deleteReleaseSchema = z.object({
  releaseName: orgNameValidator,
  projectId: z.string().uuid(),
  channel: channelSchema,
});
