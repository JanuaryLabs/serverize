import { trigger } from '@january/declarative';
import {
  createQueryBuilder,
  removeEntity,
} from '@workspace/extensions/postgresql';
import z from 'zod';
import ApiKeys from '../../../entities/api-keys.entity.ts';
export const invalidateOrganizationTokensSchema = z.object({
  organizationId: z.string().uuid(),
});

export async function invalidateOrganizationTokens(
  input: z.infer<typeof invalidateOrganizationTokensSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const qb = createQueryBuilder(ApiKeys, 'apiKeys')
    .innerJoin('apiKeys.project', 'projects')
    .innerJoin('projects.workspace', 'workspace')
    .where('workspace.organizationId = :organizationId', {
      organizationId: input.organizationId,
    });

  await removeEntity(ApiKeys, qb);
  return output.ok({});
}
