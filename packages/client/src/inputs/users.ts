import { z } from 'zod';

export const linkUserSchema = z.object({
  token: z.string(),
  providerId: z.enum(['github.com', 'google.com', 'password']),
  orgName: z.string(),
  projectName: z.string(),
});
export const signinSchema = z.object({
  token: z.string(),
  providerId: z.enum(['github.com', 'google.com', 'password']),
  source: z.enum(['vscode', 'api', 'browser']).optional(),
});
