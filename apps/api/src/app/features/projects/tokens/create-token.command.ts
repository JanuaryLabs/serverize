import { type trigger } from '@january/declarative';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import ApiKeys from '#entities/api-keys.entity.ts';
import Projects from '#entities/projects.entity.ts';
import {
  createQueryBuilder,
  execute,
  saveEntity,
} from '#extensions/postgresql/index.ts';
import { orgNameValidator } from '#extensions/zod/index.ts';
export const createTokenSchema = z.object({ projectName: orgNameValidator });

export async function createToken(
  input: z.infer<typeof createTokenSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const qb = createQueryBuilder(Projects, 'projects')
    .where('projects.name = :name', { name: input.projectName })
    .select(['projects.id']);
  const [project] = await execute(qb);
  if (!project) {
    throw new ProblemDetailsException({
      status: 404,
      title: 'Project not found',
      detail: `Project with name '${input.projectName}' not found`,
    });
  }
  const token = crypto.randomUUID().replaceAll('-', '');
  await saveEntity(ApiKeys, {
    key: token,
    projectId: project.id,
  });
  return output.ok(token);
}
