import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Releases from '#entities/releases.entity.ts';
import output from '#extensions/hono/output.ts';
import {
  createQueryBuilder,
  deferredJoinPagination,
  execute,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  router.get(
    '/releases',
    validate((payload) => ({
      projectId: {
        select: payload.query.projectId,
        against: z.string().uuid().optional(),
      },
      channel: {
        select: payload.query.channel,
        against: commonZod.channelSchema.optional(),
      },
      status: { select: payload.query.status, against: z.string().optional() },
      conclusion: {
        select: payload.query.conclusion,
        against: z.string().optional(),
      },
      pageSize: {
        select: payload.query.pageSize,
        against: z.coerce.number().int().min(1).max(50).default(50).optional(),
      },
      pageNo: {
        select: payload.query.pageNo,
        against: z.coerce.number().int().min(1).optional(),
      },
    })),
    async (context, next) => {
      const { input } = context.var;
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
    },
  );
}
