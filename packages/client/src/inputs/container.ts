import { z } from 'zod';

export const streamContainerLogsSchema = z.object({
  projectName: z.string(),
  channelName: z.string(),
  releaseName: z.string(),
  timestamp: z.boolean().default(true).optional(),
  details: z.boolean().default(true).optional(),
  tail: z.number().max(250).default(250).optional(),
});
