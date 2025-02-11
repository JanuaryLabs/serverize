import { type trigger } from '@january/declarative';
import z from 'zod';
import Secrets from '#entities/secrets.entity.ts';
import { createQueryBuilder, execute } from '#extensions/postgresql/index.ts';
import { channelSchema } from '#extensions/zod/index.ts';
export const getSecretsSchema = z.object({
  projectId: z.string().uuid(),
  channel: channelSchema,
});

export async function getSecrets(
  input: z.infer<typeof getSecretsSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const qb = createQueryBuilder(Secrets, 'secrets')
    .where('secrets.projectId = :projectId', {
      projectId: input.projectId,
    })
    .andWhere('secrets.channel = :channel', {
      channel: input.channel,
    })
    .select(['secrets.id', 'secrets.label']);
  const secrets = await execute(qb);
  return output.ok(secrets);
}
