import z from 'zod';
export const createWorkspaceSchema = z.object({
  name: z.string(),
  organizationId: z.string().uuid(),
});
