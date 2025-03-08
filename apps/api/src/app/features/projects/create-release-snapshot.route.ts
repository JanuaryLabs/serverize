import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Snapshots from '#entities/snapshots.entity.ts';
import { consume } from '#extensions/hono/consume.ts';
import output from '#extensions/hono/output.ts';
import { saveEntity } from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi CreateReleaseSnapshot
   * @tags releases
   */
  router.post(
    '/releases/:releaseId/snapshots',
    consume('application/json'),
    validate((payload) => ({
      releaseId: {
        select: payload.params.releaseId,
        against: z.string().uuid(),
      },
      name: { select: payload.body.name, against: z.string().trim().min(1) },
    })),
    async (context, next) => {
      const { input } = context.var;
      const { id } = await saveEntity(Snapshots, {
        releaseId: input.releaseId,
        name: input.name,
      });
      return output.ok({ id });
    },
  );
}
