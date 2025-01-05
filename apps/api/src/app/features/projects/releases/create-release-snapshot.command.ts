import { trigger } from '@january/declarative';
import { saveEntity } from '@workspace/extensions/postgresql';
import z from 'zod';
import Snapshots from '../snapshots.entity.ts';
export const createReleaseSnapshotSchema = z.object({
  releaseId: z.string().uuid(),
  name: z.string().trim().min(1),
});

export async function createReleaseSnapshot(
  input: z.infer<typeof createReleaseSnapshotSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const { id } = await saveEntity(Snapshots, {
    releaseId: input.releaseId,
    name: input.name,
  });
  return output.ok({ id });
}
