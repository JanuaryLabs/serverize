import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Workspaces from '#entities/workspaces.entity.ts';
import { saveEntity } from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';
import { consume, createOutput } from '#hono';

export default async function (router: Hono<HonoEnv>) {
  router.post(
    '/workspaces',
    consume('application/json'),
    validate((payload) => ({
      name: { select: payload.body.name, against: z.string().trim().min(1) },
      organizationId: {
        select: payload.body.organizationId,
        against: z.string().uuid(),
      },
    })),
    async (context, next) => {
      const { input } = context.var;
      const output = createOutput(context);
      await saveEntity(Workspaces, {
        name: input.name,
        organizationId: input.organizationId,
      });
      return output.ok();
    },
  );
}
