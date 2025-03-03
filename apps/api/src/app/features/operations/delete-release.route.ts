import axios from 'axios';
import { Hono } from 'hono';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import { getContainer, removeContainer } from 'serverize/docker';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Releases from '#entities/releases.entity.ts';
import Volumes from '#entities/volumes.entity.ts';
import {
  createQueryBuilder,
  removeEntity,
  useTransaction,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  router.delete(
    '/operations/releases/:releaseName',
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
      const { input } = context.var;
      await useTransaction(async () => {
        const release = await createQueryBuilder(Releases, 'releases')
          .where('releases.name = :name', { name: input.releaseName })
          .andWhere('releases.status = :status', { status: 'completed' })
          // .andWhere('releases.conclusion = :conclusion', {
          //   conclusion: 'success',
          // })
          .andWhere('releases.channel = :channel', {
            channel: input.channel,
          })
          .andWhere('releases.projectId = :projectId', {
            projectId: input.projectId,
          })
          .getOneOrFail();

        const container = await getContainer({
          name: release.containerName!,
        });

        if (!container) {
          throw new ProblemDetailsException({
            title: 'Container not found',
            detail: `Release ${input.releaseName} have no corresponding container`,
            status: 404,
          });
        }

        await removeEntity(Releases, release);
        await removeEntity(
          Volumes,
          createQueryBuilder(Volumes, 'volumes').where(
            'volumes.releaseId = :releaseId',
            {
              releaseId: release.id,
            },
          ),
        );
        await removeContainer(container);
      });
      return output.ok();
    },
  );
}
