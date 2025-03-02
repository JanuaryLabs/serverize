import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Organizations from '#entities/organizations.entity.ts';
import {
  createQueryBuilder,
  deferredJoinPagination,
  execute,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';
import { createOutput } from '#hono';

export default async function (router: Hono<HonoEnv>) {
  router.get(
    '/organizations',
    policies.authenticated,
    policies.adminOnly,
    validate((payload) => ({
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
      const output = createOutput(context);
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
    },
  );
}
