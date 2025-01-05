import {
  createQueryBuilder,
  execute,
  patchEntity,
  useTransaction,
} from '@workspace/extensions/postgresql';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import Releases from '../releases.entity.ts';
import { trigger } from '@january/declarative';
export const completeReleaseSchema = z.object({
  releaseId: z.string().uuid(),
  conclusion: z.enum(['success', 'failure']),
  containerName: z.string().optional(),
  tarLocation: z.string().optional(),
});

export async function completeRelease(
  input: z.infer<typeof completeReleaseSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
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
}