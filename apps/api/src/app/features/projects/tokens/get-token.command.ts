import { createQueryBuilder, execute } from '@workspace/extensions/postgresql';
import z from 'zod';

import ApiKeys from '../api-keys.entity.ts';
import { ProblemDetailsException } from 'rfc-7807-problem-details';

import { trigger } from '@january/declarative';

export const getTokenSchema = z.object({ token: z.string() });

export async function getToken(
  input: z.infer<typeof getTokenSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const qb = createQueryBuilder(ApiKeys, 'apiKeys')
    .andWhere('apiKeys.key = :key', { key: input.token })
    .innerJoinAndSelect('apiKeys.project', 'projects');

  const [token] = await execute(qb);
  if (!token) {
    throw new ProblemDetailsException({
      status: 404,
    });
  }
  return output.ok(token);
}
