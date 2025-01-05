import { trigger } from '@january/declarative';
import {
  createQueryBuilder,
  deferredJoinPagination,
  execute,
} from '@workspace/extensions/postgresql';
import { type IdentitySubject } from '@workspace/identity';
import z from 'zod';
import Projects from '../projects.entity.ts';
export const listProjectsSchema = z.object({
  workspaceId: z.string().uuid().optional(),
  name: z.string().trim().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).default(50).optional(),
  pageNo: z.coerce.number().int().min(1).optional(),
});

export async function listProjects(
  input: z.infer<typeof listProjectsSchema>,
  output: trigger.http.output,
  subject: IdentitySubject,
  signal: AbortSignal,
) {
  const qb = createQueryBuilder(Projects, 'projects').where(
    'projects.workspaceId = :workspaceId',
    { workspaceId: subject.claims.workspaceId },
  );
  for (const prop of ['workspaceId', 'name'] as const) {
    if (input[prop]) {
      qb.andWhere(`projects.${prop} = :${prop}`, {
        [prop]: input[prop],
      });
    }
  }
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
