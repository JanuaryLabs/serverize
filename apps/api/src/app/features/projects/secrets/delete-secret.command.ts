import { trigger } from '@january/declarative';
import {
  createQueryBuilder,
  removeEntity,
} from '@workspace/extensions/postgresql';
import z from 'zod';
import Secrets from '../secrets.entity.ts';
export const deleteSecretSchema = z.object({ id: z.string().uuid() });

export async function deleteSecret(
  input: z.infer<typeof deleteSecretSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const qb = createQueryBuilder(Secrets, 'secrets').where('secrets.id = :id', {
    id: input.id,
  });
  await removeEntity(Secrets, qb);
  return output.ok();
}
