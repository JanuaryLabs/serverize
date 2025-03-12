import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Projects from '#entities/projects.entity.ts';
import output from '#extensions/hono/output.ts';
import {
  createQueryBuilder,
  deferredJoinPagination,
  execute,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi listProjects
   * @tags projects
   */
  router.get(
    '/projects',
    policies.authenticated,
    validate((payload) => ({
      workspaceId: {
        select: payload.query.workspaceId,
        against: z.string().uuid().optional(),
      },
      name: {
        select: payload.query.name,
        against: z.string().trim().min(1).optional(),
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
      const signal = context.req.raw.signal;
      const { input, subject } = context.var;
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
    },
  );
}
