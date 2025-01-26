import z from 'zod';
import { channelSchema, orgNameValidator } from '../zod';
export const createTokenSchema = z.object({ projectName: orgNameValidator });
export const revokeTokenSchema = z.object({
  projectName: z.string(),
  token: z.string(),
});
export const listTokensSchema = z.object({ projectName: z.string() });
export const getTokenSchema = z.object({ token: z.string() });
export const createReleaseSchema = z.object({
  releaseName: orgNameValidator,
  projectId: z.string().uuid(),
  channel: channelSchema,
});
export const completeReleaseSchema = z.object({
  releaseId: z.string().uuid(),
  conclusion: z.enum(['success', 'failure']),
  containerName: z.string().optional(),
  tarLocation: z.string().optional(),
});
export const patchReleaseSchema = z.object({
  releaseId: z.string().uuid(),
  status: z.enum(['requested', 'waiting', 'completed']).optional(),
  conclusion: z.enum(['success', 'failure']).optional(),
  containerName: z.string().optional(),
});
export const createReleaseSnapshotSchema = z.object({
  releaseId: z.string().uuid(),
  name: z.string().trim().min(1),
});
export const listReleasesSchema = z.object({
  projectId: z.string().uuid().optional(),
  channel: channelSchema.optional(),
  status: z.string().optional(),
  conclusion: z.string().optional(),
  pageSize: z.coerce.number().int().min(1).max(50).default(50).optional(),
  pageNo: z.coerce.number().int().min(1).optional(),
});
export const createSecretSchema = z.object({
  projectId: z.string().uuid(),
  channel: channelSchema,
  secretLabel: z.string().trim().min(1),
  secretValue: z.string().min(1),
});
export const getSecretsSchema = z.object({
  projectId: z.string().uuid(),
  channel: channelSchema,
});
export const deleteSecretSchema = z.object({ id: z.string().uuid() });
export const getSecretsValuesSchema = z.object({
  projectId: z.string().uuid(),
  channel: channelSchema,
});
export const exchangeTokenSchema = z.object({ token: z.string() });
export const invalidateOrganizationTokensSchema = z.object({
  organizationId: z.string().uuid(),
});
