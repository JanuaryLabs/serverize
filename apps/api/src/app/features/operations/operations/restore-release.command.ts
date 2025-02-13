import { type trigger } from '@january/declarative';
import axios from 'axios';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import Releases from '#entities/releases.entity.ts';
import Volumes from '#entities/volumes.entity.ts';
import {
  createQueryBuilder,
  execute,
  useTransaction,
} from '#extensions/postgresql/index.ts';
import { channelSchema, orgNameValidator } from '#extensions/zod/index.ts';
export const restoreReleaseSchema = z.object({
  releaseName: orgNameValidator,
  projectId: z.string().uuid(),
  channel: channelSchema,
});

export async function restoreRelease(
  input: z.infer<typeof restoreReleaseSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
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
}
