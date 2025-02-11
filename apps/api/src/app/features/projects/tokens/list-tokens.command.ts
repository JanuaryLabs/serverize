import { type trigger } from '@january/declarative';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import ApiKeys from '#entities/api-keys.entity.ts';
import Projects from '#entities/projects.entity.ts';
import { createQueryBuilder, execute } from '#extensions/postgresql/index.ts';
export const listTokensSchema = z.object({ projectName: z.string() });

export async function listTokens(
  input: z.infer<typeof listTokensSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const projectQb = createQueryBuilder(Projects, 'projects')
    .where('projects.name = :name', { name: input.projectName })
    .select(['projects.id']);
  const [project] = await execute(projectQb);
  if (!project) {
    throw new ProblemDetailsException({
      status: 404,
      title: 'Project not found',
      detail: `Project with name '${input.projectName}' not found`,
    });
  }
  const qb = createQueryBuilder(ApiKeys, 'apiKeys')
    .where('apiKeys.projectId = :projectId', {
      projectId: project.id,
    })
    .innerJoinAndSelect('apiKeys.project', 'projects');

  const records = await execute(qb);
  return output.ok(records);
}
