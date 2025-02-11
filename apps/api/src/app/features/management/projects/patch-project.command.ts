import { type trigger } from '@january/declarative';
import z from 'zod';
import Projects from '#entities/projects.entity.ts';
import {
  createQueryBuilder,
  patchEntity,
} from '#extensions/postgresql/index.ts';
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
