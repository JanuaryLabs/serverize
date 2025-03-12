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
  execute,
  saveEntity,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi CreateRelease
   * @tags releases
   */
  router.post(
    '/releases',
    consume('application/json'),
    validate((payload) => ({
      releaseName: {
        select: payload.body.releaseName,
        against: commonZod.orgNameValidator,
      },
      projectId: { select: payload.body.projectId, against: z.string().uuid() },
      channel: {
        select: payload.body.channel,
        against: commonZod.channelSchema,
      },
    })),
    async (context, next) => {
      const signal = context.req.raw.signal;
      const { input } = context.var;
      const qb = createQueryBuilder(Releases, 'releases')
        .where('releases.name = :name', { name: input.releaseName })
        .andWhere('releases.projectId = :projectId', {
          projectId: input.projectId,
        })
        .andWhere('releases.channel = :channel', { channel: input.channel })
        .limit(1);

      const [release] = await execute(qb);
      if (release) {
        //
      }

      const { id } = await saveEntity(Releases, {
        projectId: input.projectId,
        status: 'in_progress',
        channel: input.channel,
        name: input.releaseName,
      });
      return output.ok({ id });
    },
  );
}
