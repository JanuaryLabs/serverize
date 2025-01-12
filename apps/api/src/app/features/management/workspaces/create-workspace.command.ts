import { trigger } from '@january/declarative';
import { saveEntity } from '@workspace/extensions/postgresql';
import z from 'zod';
import Workspaces from '../../../entities/workspaces.entity.ts';
export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1),
  organizationId: z.string().uuid(),
});

export async function createWorkspace(
  input: z.infer<typeof createWorkspaceSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  await saveEntity(Workspaces, {
    name: input.name,
    organizationId: input.organizationId,
  });
  return output.ok();
}
