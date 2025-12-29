import { z } from 'zod';

export const deleteOrgSchema = z.object({ id: z.string().uuid() });
export const listOrganizationsSchema = z.object({
  pageSize: z.number().min(1).max(50).default(50).optional(),
  pageNo: z.number().min(1).optional(),
});
export const createOrganizationSchema = z.object({ name: z.string() });
export const createDefaultOrganizationSchema = z.object({
  name: z.string(),
  projectName: z.string(),
  uid: z.string(),
});
