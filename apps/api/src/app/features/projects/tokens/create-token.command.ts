import { trigger } from '@january/declarative';
import { saveEntity } from '@workspace/extensions/postgresql';
import { type IdentitySubject } from '@workspace/identity';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import ApiKeys from '../api-keys.entity.ts';
export const createTokenSchema = z.object({ projectId: z.string().uuid() });

export async function createToken(
  input: z.infer<typeof createTokenSchema>,
  output: trigger.http.output,
  subject: IdentitySubject,
  signal: AbortSignal,
) {
  const token = crypto.randomUUID().replaceAll('-', '');
  if (!subject) {
    throw new ProblemDetailsException({
      status: 401,
    });
  }
  await saveEntity(ApiKeys, {
    key: token,
    projectId: input.projectId,
    organizationId: subject.claims.organizationId,
  });
  return output.ok(token);
}
