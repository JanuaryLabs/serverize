import { trigger } from '@january/declarative';
import { saveEntity } from '@workspace/extensions/postgresql';
import z from 'zod';
import Organizations from '../../../entities/organizations.entity.ts';
export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1),
});

export async function createOrganization(
  input: z.infer<typeof createOrganizationSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  await saveEntity(Organizations, {
    name: input.name,
  });
  return output.ok();
}
