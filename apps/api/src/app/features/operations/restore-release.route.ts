import { Hono } from 'hono';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Releases from '#entities/releases.entity.ts';
import Volumes from '#entities/volumes.entity.ts';
import { consume } from '#extensions/hono/consume.ts';
import output from '#extensions/hono/output.ts';
import {
  createQueryBuilder,
  execute,
  useTransaction,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi RestoreRelease
   * @tags operations
   */
  router.post(
    '/operations/releases/:releaseName/restore',
    policies.authenticated,
    policies.notImplemented,
    consume('application/json'),
    validate((payload) => ({
      releaseName: {
        select: payload.params.releaseName,
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
      await useTransaction(async () => {
        const releaseQb = createQueryBuilder(Releases, 'releases')
          .withDeleted()
          .where('releases.name = :name', { name: input.releaseName })
          .andWhere('releases.channel = :channel', {
            channel: input.channel,
          })
          .andWhere('releases.projectId = :projectId', {
            projectId: input.projectId,
          });

        const release = await releaseQb.getOne();

        if (!release) {
          throw new ProblemDetailsException({
            title: 'Release not found',
            detail: `Release ${input.releaseName} not found`,
            status: 404,
          });
        }

        await releaseQb.restore().execute();

        // Restore associated volumes
        const volumesQb = createQueryBuilder(Volumes, 'volumes')
          .withDeleted()
          .where('volumes.releaseId = :releaseId', {
            releaseId: release.id,
          });

        await volumesQb.restore().execute();
      });
      return output.ok();
    },
  );
}
