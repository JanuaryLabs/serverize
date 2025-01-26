import { trigger } from '@january/declarative';
import {
  createQueryBuilder,
  execute,
  removeEntity,
} from '@workspace/extensions/postgresql';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import ApiKeys from '../../../entities/api-keys.entity.ts';
import Projects from '../../../entities/projects.entity.ts';
export const revokeTokenSchema = z.object({
  projectName: z.string(),
  token: z.string(),
});

export async function revokeToken(
  input: z.infer<typeof revokeTokenSchema>,
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
    .andWhere('apiKeys.key = :key', { key: input.token });
  await removeEntity(ApiKeys, qb);
  return output.ok();
}
