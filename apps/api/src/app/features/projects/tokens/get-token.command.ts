import { type trigger } from '@january/declarative';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import ApiKeys from '#entities/api-keys.entity.ts';
import { createQueryBuilder, execute } from '#extensions/postgresql/index.ts';
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
