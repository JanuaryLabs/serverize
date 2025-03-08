import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Secrets from '#entities/secrets.entity.ts';
import output from '#extensions/hono/output.ts';
import { createQueryBuilder, execute } from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi GetSecrets
   * @tags secrets
   */
  router.get(
    '/secrets',
    validate((payload) => ({
      projectId: {
        select: payload.query.projectId,
        against: z.string().uuid(),
      },
      channel: {
        select: payload.query.channel,
        against: commonZod.channelSchema,
      },
    })),
    async (context, next) => {
      const { input } = context.var;
      const qb = createQueryBuilder(Secrets, 'secrets')
        .where('secrets.projectId = :projectId', {
          projectId: input.projectId,
        })
        .andWhere('secrets.channel = :channel', {
          channel: input.channel,
        })
        .select(['secrets.id', 'secrets.label']);
      const secrets = await execute(qb);
      return output.ok(secrets);
    },
  );
}
