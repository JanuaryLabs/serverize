import {
  createQueryBuilder,
  removeEntity,
} from '@workspace/extensions/postgresql';
import z from 'zod';

import Organizations from '../organizations.entity.ts';

import { trigger } from '@january/declarative';

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
