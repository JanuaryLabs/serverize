import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Secrets from '#entities/secrets.entity.ts';
import { consume } from '#extensions/hono/consume.ts';
import output from '#extensions/hono/output.ts';
import { upsertEntity } from '#extensions/postgresql/index.ts';
import { encrypt, getProjectKey } from '#extensions/user/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  router.post(
    '/secrets',
    consume('application/json'),
    validate((payload) => ({
      projectId: { select: payload.body.projectId, against: z.string().uuid() },
      channel: {
        select: payload.body.channel,
        against: commonZod.channelSchema,
      },
      secretLabel: {
        select: payload.body.secretLabel,
        against: z.string().trim().min(1),
      },
      secretValue: {
        select: payload.body.secretValue,
        against: z.string().min(1),
      },
    })),
    async (context, next) => {
      const { input } = context.var;
      const key = await getProjectKey(input.projectId);
      const { nonce, secret } = await encrypt(key, input.secretValue);
      await upsertEntity(
        Secrets,
        {
          projectId: input.projectId,
          label: input.secretLabel,
          channel: input.channel,
          nonce,
          secret,
        },
        {
          conflictColumns: ['projectId', 'label'],
          upsertColumns: ['nonce', 'secret'],
        },
      );
      return output.ok({});
    },
  );
}
