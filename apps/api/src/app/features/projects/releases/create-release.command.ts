import { type trigger } from '@january/declarative';
import z from 'zod';
import Releases from '#entities/releases.entity.ts';
import {
  createQueryBuilder,
  execute,
  saveEntity,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';
export const createReleaseSchema = z.object({
  releaseName: commonZod.orgNameValidator,
  projectId: z.string().uuid(),
  channel: commonZod.channelSchema,
});

export async function createRelease(
  input: z.infer<typeof createReleaseSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
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

  let { id } = await saveEntity(Releases, {
    projectId: input.projectId,
    status: 'in_progress',
    channel: input.channel,
    name: input.releaseName,
  });
  return output.ok({ id });
}
