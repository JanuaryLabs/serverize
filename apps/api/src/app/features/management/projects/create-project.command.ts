import { trigger } from '@january/declarative';
import { saveEntity } from '@workspace/extensions/postgresql';
import { orgNameValidator } from '@workspace/extensions/zod';
import { type IdentitySubject } from '@workspace/identity';
import z from 'zod';
import Projects from '../projects.entity.ts';
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
