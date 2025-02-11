import { type trigger } from '@january/declarative';
import z from 'zod';
import { type IdentitySubject } from '#core/identity/subject.ts';
import Projects from '#entities/projects.entity.ts';
import { saveEntity } from '#extensions/postgresql/index.ts';
import { orgNameValidator } from '#extensions/zod/index.ts';
export const createProjectSchema = z.object({ name: orgNameValidator });

export async function createProject(
  input: z.infer<typeof createProjectSchema>,
  output: trigger.http.output,
  subject: IdentitySubject,
  signal: AbortSignal,
) {
  // FIXME: workspaceId should come from the body
  // user should select in what workspace the project should be created
  // there's no use of it in the claims.
  // IMPORTANT: at the moment project can be created without workspaceId (floating project) must be fixed
  await saveEntity(Projects, {
    name: input.name,
    workspaceId: subject.claims.workspaceId,
  });
  return output.ok();
}
