import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Workspaces from '#entities/workspaces.entity.ts';
import { consume } from '#extensions/hono/consume.ts';
import output from '#extensions/hono/output.ts';
import { saveEntity } from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi createWorkspace
   * @tags workspaces
   */
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
      const signal = context.req.raw.signal;
      const { input } = context.var;
      await saveEntity(Workspaces, {
        name: input.name,
        organizationId: input.organizationId,
      });
      return output.ok();
    },
  );
}
