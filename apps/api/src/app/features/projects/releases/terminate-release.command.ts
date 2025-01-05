import {
  createQueryBuilder,
  removeEntity,
} from '@workspace/extensions/postgresql';
import { channelSchema, orgNameValidator } from '@workspace/extensions/zod';
import z from 'zod';

import Releases from '../releases.entity.ts';

import { trigger } from '@january/declarative';

export const terminateReleaseSchema = z.object({
  projectId: z.string().uuid(),
  releaseName: orgNameValidator,
  channelName: channelSchema,
});

export async function terminateRelease(
  input: z.infer<typeof terminateReleaseSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const qb = createQueryBuilder(Releases, 'releases')
    .where('releases.projectId = :projectId', {
      projectId: input.projectId,
    })
    .andWhere('releases.channel = :channel', {
      channel: input.channelName,
    })
    .andWhere('releases.name = :name', {
      name: input.releaseName,
    });

  // TODO: send to manager to terminate
  // and move it to operations feature

  await removeEntity(Releases, qb);
  return output.ok({});
}
