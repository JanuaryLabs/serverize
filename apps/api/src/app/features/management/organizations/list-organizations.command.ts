import { type trigger } from '@january/declarative';
import z from 'zod';
import Organizations from '#entities/organizations.entity.ts';
import {
  createQueryBuilder,
  deferredJoinPagination,
  execute,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';
export const listOrganizationsSchema = z.object({
  pageSize: z.coerce.number().int().min(1).max(50).default(50).optional(),
  pageNo: z.coerce.number().int().min(1).optional(),
});

export async function listOrganizations(
  input: z.infer<typeof listOrganizationsSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const qb = createQueryBuilder(Organizations, 'organizations');
  const paginationMetadata = deferredJoinPagination(qb, {
    pageSize: input.pageSize,
    pageNo: input.pageNo,
    count: await qb.getCount(),
  });
  const records = await execute(qb);
  return output.ok({
    records,
    meta: paginationMetadata(records),
  });
}
