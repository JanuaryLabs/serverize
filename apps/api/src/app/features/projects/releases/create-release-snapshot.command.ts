import { type trigger } from '@january/declarative';
import z from 'zod';
import Snapshots from '#entities/snapshots.entity.ts';
import { saveEntity } from '#extensions/postgresql/index.ts';
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
