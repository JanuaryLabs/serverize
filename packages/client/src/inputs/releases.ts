import { z } from 'zod';
export const createReleaseSchema = z.object({
  releaseName: z.string(),
  projectId: z.string().uuid(),
  channel: z.enum(['dev', 'preview']).default('dev'),
});
export const listReleasesSchema = z.object({
  projectId: z.string().uuid().optional(),
  channel: z.enum(['dev', 'preview']).default('dev').optional(),
  status: z.string().optional(),
  conclusion: z.string().optional(),
  pageSize: z.number().min(1).max(50).default(50).optional(),
  pageNo: z.number().min(1).optional(),
});
export const completeReleaseSchema = z.object({
  conclusion: z.enum(['success', 'failure']).optional(),
  containerName: z.string().optional(),
  tarLocation: z.string().optional(),
  releaseId: z.string().uuid(),
});
export const patchReleaseSchema = z.object({
  status: z.enum(['requested', 'waiting', 'completed']).optional(),
  conclusion: z.enum(['success', 'failure']).optional(),
  containerName: z.string().optional(),
  releaseId: z.string().uuid(),
});
export const createReleaseSnapshotSchema = z.object({
  name: z.string().optional(),
  releaseId: z.string().uuid(),
});
