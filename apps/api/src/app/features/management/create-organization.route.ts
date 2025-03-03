import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Organizations from '#entities/organizations.entity.ts';
import { consume } from '#extensions/hono/consume.ts';
import output from '#extensions/hono/output.ts';
import { saveEntity } from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  router.post(
    '/organizations',
    consume('application/json'),
    validate((payload) => ({
      name: { select: payload.body.name, against: z.string().trim().min(1) },
    })),
    async (context, next) => {
      const { input } = context.var;
      await saveEntity(Organizations, {
        name: input.name,
      });
      return output.ok();
    },
  );
}
