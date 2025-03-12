import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import ApiKeys from '#entities/api-keys.entity.ts';
import output from '#extensions/hono/output.ts';
import {
  createQueryBuilder,
  removeEntity,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi InvalidateOrganizationTokens
   * @tags tokens
   */
  router.delete(
    '/tokens/organization/:organizationId',
    policies.authenticated,
    validate((payload) => ({
      organizationId: {
        select: payload.params.organizationId,
        against: z.string().uuid(),
      },
    })),
    async (context, next) => {
      const signal = context.req.raw.signal;
      const { input } = context.var;
      const qb = createQueryBuilder(ApiKeys, 'apiKeys')
        .innerJoin('apiKeys.project', 'projects')
        .innerJoin('projects.workspace', 'workspace')
        .where('workspace.organizationId = :organizationId', {
          organizationId: input.organizationId,
        });

      await removeEntity(ApiKeys, qb);
      return output.ok({});
    },
  );
}
