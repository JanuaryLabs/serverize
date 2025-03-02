import { type trigger } from '@january/declarative';
import { getAuth } from 'firebase-admin/auth';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import ApiKeys from '#entities/api-keys.entity.ts';
import { firebaseApp } from '#extensions/firebase-auth/index.ts';
import { createQueryBuilder, execute } from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';
export const exchangeTokenSchema = z.object({ token: z.string() });

export async function exchangeToken(
  input: z.infer<typeof exchangeTokenSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const qb = createQueryBuilder(ApiKeys, 'apiKeys')
    .where('apiKeys.key = :key', { key: input.token })
    .innerJoinAndSelect('apiKeys.project', 'projects')
    .innerJoinAndSelect('projects.workspace', 'workspace');

  const [apiKey] = await execute(qb);
  if (!apiKey) {
    throw new ProblemDetailsException({
      status: 401,
      title: 'Invalid API token',
      detail: 'The provided API token is invalid or has been revoked',
    });
  }

  const auth = getAuth(firebaseApp);
  const customToken = await auth.createCustomToken(crypto.randomUUID(), {
    source: 'api',
    organizationId: apiKey.project.workspace.organizationId,
    workspaceId: apiKey.project.workspaceId,
    projectId: apiKey.projectId,
    aknowledged: true,
  });
  return output.ok({ accessToken: customToken });
}
