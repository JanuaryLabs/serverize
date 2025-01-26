import z from 'zod';
import { channelSchema, orgNameValidator } from '../zod';
export const streamContainerLogsSchema = z.object({
  projectName: orgNameValidator,
  channelName: orgNameValidator,
  releaseName: orgNameValidator,
  timestamp: z.boolean().default(true).optional(),
  details: z.boolean().default(true).optional(),
  tail: z.number().max(250).default(250).optional(),
});
export const configDiscoverySchema = z.object({});
