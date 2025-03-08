import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import output from '#extensions/hono/output.ts';
import { getChannelEnv } from '#extensions/user/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi GetSecretsValues
   * @tags secrets
   */
  router.get(
    '/secrets/values',
    policies.authenticated,
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
      const env = await getChannelEnv({
        projectId: input.projectId,
        channel: input.channel,
      });
      return output.ok(env);
    },
  );
}
