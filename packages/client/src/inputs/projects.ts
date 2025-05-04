import { z } from 'zod';
export const createProjectSchema = z.object({ name: z.string() });
export const listProjectsSchema = z.object({
  workspaceId: z.string().uuid().optional(),
  name: z.string().optional(),
  pageSize: z.number().min(1).max(50).default(50).optional(),
  pageNo: z.number().min(1).optional(),
});
export const patchProjectSchema = z.object({
  name: z.string().optional(),
  id: z.string().uuid(),
});
