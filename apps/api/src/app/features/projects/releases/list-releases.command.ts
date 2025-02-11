import { type trigger } from '@january/declarative';
import z from 'zod';
import Releases from '#entities/releases.entity.ts';
import {
  createQueryBuilder,
  deferredJoinPagination,
  execute,
} from '#extensions/postgresql/index.ts';
import { channelSchema } from '#extensions/zod/index.ts';
export const listReleasesSchema = z.object({
  projectId: z.string().uuid().optional(),
  channel: channelSchema.optional(),
  status: z.string().optional(),
  conclusion: z.string().optional(),
  pageSize: z.coerce.number().int().min(1).max(50).default(50).optional(),
  pageNo: z.coerce.number().int().min(1).optional(),
});

export async function listReleases(
  input: z.infer<typeof listReleasesSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const qb = createQueryBuilder(Releases, 'releases');
  for (const prop of [
    'projectId',
    'channel',
    'status',
    'conclusion',
  ] as const) {
    if (input[prop]) {
      qb.andWhere(`releases.${prop} = :${prop}`, {
        [prop]: input[prop],
      });
    }
  }
  qb.innerJoinAndSelect('releases.project', 'projects');

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
