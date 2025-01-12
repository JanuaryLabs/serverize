import { trigger } from '@january/declarative';
import {
  createQueryBuilder,
  deferredJoinPagination,
  execute,
} from '@workspace/extensions/postgresql';
import { type IdentitySubject } from '@workspace/identity';
import z from 'zod';
import Organizations from '../../../entities/organizations.entity.ts';

export async function listUserOrganizations(
  output: trigger.http.output,
  subject: IdentitySubject,
  signal: AbortSignal,
) {
  const qb = createQueryBuilder(Organizations, 'organizations')
    .innerJoin('organizations.members', 'members')
    .where('members.userId = :userId', { userId: subject.claims.uid });
  const records = await execute(qb);
  const paginationMetadata = deferredJoinPagination(qb, {
    pageSize: 50,
    pageNo: 1,
    count: await qb.getCount(),
  });
  // This endpoint should return projects as well
  return output.ok({
    records,
    meta: paginationMetadata(records),
  });
}
