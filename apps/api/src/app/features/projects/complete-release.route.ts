import { Hono } from 'hono';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
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
  patchEntity,
  useTransaction,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi CompleteRelease
   * @tags releases
   */
  router.patch(
    '/releases/complete/:releaseId',
    consume('application/json'),
    validate((payload) => ({
      releaseId: {
        select: payload.params.releaseId,
        against: z.string().uuid(),
      },
      conclusion: {
        select: payload.body.conclusion,
        against: z.enum(['success', 'failure']),
      },
      containerName: {
        select: payload.body.containerName,
        against: z.string().optional(),
      },
      tarLocation: {
        select: payload.body.tarLocation,
        against: z.string().optional(),
      },
    })),
    async (context, next) => {
      const { input } = context.var;
      await useTransaction(async () => {
        const patchObject: Record<string, any> = {};
        (['conclusion', 'containerName', 'tarLocation'] as const).forEach(
          (prop) => {
            if (input[prop]) {
              patchObject[prop] = input[prop];
            }
          },
        );
        const releaseQb = createQueryBuilder(Releases, 'releases').where(
          'releases.id = :releaseId',
          { releaseId: input.releaseId },
        );
        const [release] = await execute(releaseQb);
        if (!release) {
          throw new ProblemDetailsException({
            status: 400,
            title: 'Release not found',
            detail: `Release with id ${input.releaseId} not found`,
          });
        }
        await patchEntity(releaseQb, { ...patchObject, status: 'completed' });

        if (input.conclusion !== 'success') {
          return;
        }
        const qb = createQueryBuilder(Releases, 'releases')
          .where('"releases"."projectId" = :projectId', {
            projectId: release.projectId,
          })
          .andWhere('releases.channel = :channel', {
            channel: release.channel,
          })
          .andWhere('releases.id != :releaseId', {
            releaseId: input.releaseId,
          })
          .andWhere('releases.name = :name', { name: release.name });
        if (release.serviceName) {
          qb.andWhere('releases.serviceName = :serviceName', {
            serviceName: release.serviceName,
          });
        }

        await qb.softDelete().execute();
      });
      return output.ok({});
    },
  );
}
