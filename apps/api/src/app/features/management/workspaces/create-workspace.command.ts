import { type trigger } from '@january/declarative';
import z from 'zod';
import Workspaces from '#entities/workspaces.entity.ts';
import { saveEntity } from '#extensions/postgresql/index.ts';
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
