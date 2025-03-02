import { type trigger } from '@january/declarative';
import z from 'zod';
import Organizations from '#entities/organizations.entity.ts';
import { saveEntity } from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';
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
