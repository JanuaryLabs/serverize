import {
  createQueryBuilder,
  removeEntity,
} from '@workspace/extensions/postgresql';
import z from 'zod';
import ApiKeys from '../api-keys.entity.ts';
import { trigger } from '@january/declarative';
import { type IdentitySubject } from '@workspace/identity';
export const revokeTokenSchema = z.object({ token: z.string() });

export async function revokeToken(
  input: z.infer<typeof revokeTokenSchema>,
  output: trigger.http.output,
  subject: IdentitySubject,
  signal: AbortSignal,
) {
  const qb = createQueryBuilder(ApiKeys, 'apiKeys')
    .where('apiKeys.organizationId = :organizationId', {
      organizationId: subject.claims.organizationId,
    })
    .andWhere('apiKeys.key = :key', { key: input.token });
  await removeEntity(ApiKeys, qb);
  return output.ok();
}