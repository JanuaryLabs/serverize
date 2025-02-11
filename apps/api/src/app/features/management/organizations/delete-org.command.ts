import { type trigger } from '@january/declarative';
import z from 'zod';
import Organizations from '#entities/organizations.entity.ts';
import {
  createQueryBuilder,
  removeEntity,
} from '#extensions/postgresql/index.ts';
export const deleteOrgSchema = z.object({ id: z.string().uuid() });

export async function deleteOrg(
  input: z.infer<typeof deleteOrgSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const qb = createQueryBuilder(Organizations, 'organizations').where(
    'organizations.id = :id',
    { id: input.id },
  );
  await removeEntity(Organizations, qb);
  return output.ok();
}
