import z from 'zod';
import * as commonZod from '../zod';
export const streamContainerLogsSchema = z.object({
  projectName: commonZod.orgNameValidator,
  channelName: commonZod.orgNameValidator,
  releaseName: commonZod.orgNameValidator,
  timestamp: z.boolean().default(true).optional(),
  details: z.boolean().default(true).optional(),
  tail: z.number().max(250).default(250).optional(),
});
export const configDiscoverySchema = z.object({});
