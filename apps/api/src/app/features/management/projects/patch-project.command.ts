import {
  createQueryBuilder,
  patchEntity,
} from '@workspace/extensions/postgresql';
import z from 'zod';

import Projects from '../projects.entity.ts';

import { trigger } from '@january/declarative';

export const patchProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
});

export async function patchProject(
  input: z.infer<typeof patchProjectSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const qb = createQueryBuilder(Projects, 'projects').where(
    'projects.id = :id',
    { id: input.id },
  );
  await patchEntity(qb, {
    name: input.name,
  });
  return output.ok();
}
