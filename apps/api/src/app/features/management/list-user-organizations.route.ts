import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import Organizations from '#entities/organizations.entity.ts';
import output from '#extensions/hono/output.ts';
import {
  createQueryBuilder,
  deferredJoinPagination,
  execute,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  router.get(
    '/users/organizations',
    policies.authenticated,
    async (context, next) => {
      const { subject } = context.var;
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
    },
  );
}
