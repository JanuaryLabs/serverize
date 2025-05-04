import { z } from 'zod';
export const createTokenSchema = z.object({ projectName: z.string() });
export const revokeTokenSchema = z.object({
  projectName: z.string(),
  token: z.string(),
});
export const listTokensSchema = z.object({ projectName: z.string() });
export const getTokenSchema = z.object({ token: z.string() });
export const exchangeTokenSchema = z.object({ token: z.string() });
export const invalidateOrganizationTokensSchema = z.object({
  organizationId: z.string().uuid(),
});
