import { type trigger } from '@january/declarative';
import axios from 'axios';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import { getContainer, removeContainer } from 'serverize/docker';
import z from 'zod';
import Releases from '#entities/releases.entity.ts';
import Volumes from '#entities/volumes.entity.ts';
import {
  createQueryBuilder,
  removeEntity,
  useTransaction,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';
export const deleteReleaseSchema = z.object({
  releaseName: commonZod.orgNameValidator,
  projectId: z.string().uuid(),
  channel: commonZod.channelSchema,
});

export async function deleteRelease(
  input: z.infer<typeof deleteReleaseSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
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
}
