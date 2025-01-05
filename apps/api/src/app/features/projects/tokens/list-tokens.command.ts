import { createQueryBuilder, execute } from '@workspace/extensions/postgresql';
import z from 'zod';
import ApiKeys from '../api-keys.entity.ts';
import { trigger } from '@january/declarative';
import { type IdentitySubject } from '@workspace/identity';

export async function listTokens(
  output: trigger.http.output,
  subject: IdentitySubject,
  signal: AbortSignal,
) {
  const qb = createQueryBuilder(ApiKeys, 'apiKeys')
    .where('apiKeys.organizationId = :organizationId', {
      organizationId: subject.claims.organizationId,
    })
    .innerJoinAndSelect('apiKeys.project', 'projects');

  const records = await execute(qb);
  return output.ok(records);
}