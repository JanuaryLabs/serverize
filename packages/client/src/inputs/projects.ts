import {orgNameValidator,channelSchema} from '../zod';
import z from 'zod';
export const createTokenSchema = z.object({projectId: z.string().uuid()});
export const revokeTokenSchema = z.object({token: z.string()});
export const listTokensSchema = z.object({});
export const getTokenSchema = z.object({token: z.string()});
export const createReleaseSchema = z.object({releaseName: orgNameValidator, projectId: z.string().uuid(), channel: channelSchema});
export const completeReleaseSchema = z.object({releaseId: z.string().uuid(), conclusion: z.enum(['success', 'failure']), containerName: z.string().optional(), tarLocation: z.string().optional()});
export const patchReleaseSchema = z.object({releaseId: z.string().uuid(), status: z.enum(['requested', 'waiting', 'completed']).optional(), conclusion: z.enum(['success', 'failure']).optional(), containerName: z.string().optional()});
export const createReleaseSnapshotSchema = z.object({releaseId: z.string().uuid(), name: z.string().trim().min(1)});
export const listReleasesSchema = z.object({projectId: z.string().uuid().optional(), channel: channelSchema, status: z.string().optional(), conclusion: z.string().optional(), pageSize: z.coerce
							.number()
							.int()
							.min(1)
							.max(50)
							.default(50)
							.optional(), pageNo: z.coerce.number().int().min(1).optional()});
export const terminateReleaseSchema = z.object({projectId: z.string().uuid(), releaseName: orgNameValidator, channelName: channelSchema});
export const createSecretSchema = z.object({projectId: z.string().uuid(), channel: channelSchema, secretLabel: z.string().trim().min(1), secretValue: z.string().min(1)});
export const getSecretsSchema = z.object({projectId: z.string().uuid(), channel: channelSchema});
export const getSecretsValuesSchema = z.object({projectId: z.string().uuid(), channel: channelSchema});