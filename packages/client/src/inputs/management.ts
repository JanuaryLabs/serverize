import z from 'zod';
import { channelSchema, orgNameValidator } from '../zod';
export const deleteOrgSchema = z.object({ id: z.string().uuid() });
export const listOrganizationsSchema = z.object({
  pageSize: z.coerce.number().int().min(1).max(50).default(50).optional(),
  pageNo: z.coerce.number().int().min(1).optional(),
});
export const createDefaultOrganizationSchema = z.object({
  name: orgNameValidator,
  projectName: orgNameValidator,
  uid: z.string().trim().min(1),
});
export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1),
});
export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1),
  organizationId: z.string().uuid(),
});
export const createProjectSchema = z.object({ name: orgNameValidator });
export const patchProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
});
export const listProjectsSchema = z.object({
  workspaceId: z.string().uuid().optional(),
  name: z.string().trim().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).default(50).optional(),
  pageNo: z.coerce.number().int().min(1).optional(),
});
export const listUserOrganizationsSchema = z.object({});
export const linkUserSchema = z.object({
  token: z.string(),
  providerId: z.enum(['github.com', 'google.com', 'password']),
  orgName: orgNameValidator,
  projectName: orgNameValidator,
});
export const signinSchema = z.object({
  token: z.string(),
  providerId: z.enum(['github.com', 'google.com', 'password']),
});
