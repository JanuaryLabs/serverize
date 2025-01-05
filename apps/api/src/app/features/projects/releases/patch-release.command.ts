import { trigger } from '@january/declarative';
import {
  createQueryBuilder,
  patchEntity,
} from '@workspace/extensions/postgresql';
import z from 'zod';
import Releases from '../releases.entity.ts';
export const patchReleaseSchema = z.object({
  releaseId: z.string().uuid(),
  status: z.enum(['requested', 'waiting', 'completed']).optional(),
  conclusion: z.enum(['success', 'failure']).optional(),
  containerName: z.string().optional(),
});

export async function patchRelease(
  input: z.infer<typeof patchReleaseSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
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
}
