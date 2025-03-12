import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Releases from '#entities/releases.entity.ts';
import { consume } from '#extensions/hono/consume.ts';
import output from '#extensions/hono/output.ts';
import {
  createQueryBuilder,
  patchEntity,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi PatchRelease
   * @tags releases
   */
  router.patch(
    '/releases/:releaseId',
    consume('application/json'),
    validate((payload) => ({
      releaseId: {
        select: payload.params.releaseId,
        against: z.string().uuid(),
      },
      status: {
        select: payload.body.status,
        against: z.enum(['requested', 'waiting', 'completed']).optional(),
      },
      conclusion: {
        select: payload.body.conclusion,
        against: z.enum(['success', 'failure']).optional(),
      },
      containerName: {
        select: payload.body.containerName,
        against: z.string().optional(),
      },
    })),
    async (context, next) => {
      const signal = context.req.raw.signal;
      const { input } = context.var;
      const qb = createQueryBuilder(Releases, 'releases').where(
        'releases.id = :releaseId',
        { releaseId: input.releaseId },
      );
      const patchObject: Record<string, any> = {};
      (['status', 'conclusion', 'containerName'] as const).forEach((prop) => {
        if (input[prop]) {
          patchObject[prop] = input[prop];
        }
      });
      await patchEntity(qb, patchObject);
      return output.ok({});
    },
  );
}
