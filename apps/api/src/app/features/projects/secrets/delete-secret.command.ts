import { type trigger } from '@january/declarative';
import z from 'zod';
import Secrets from '#entities/secrets.entity.ts';
import {
  createQueryBuilder,
  removeEntity,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';
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
