import { type trigger } from '@january/declarative';
import z from 'zod';
import Secrets from '#entities/secrets.entity.ts';
import { upsertEntity } from '#extensions/postgresql/index.ts';
import { encrypt, getProjectKey } from '#extensions/user/index.ts';
import * as commonZod from '#extensions/zod/index.ts';
export const createSecretSchema = z.object({
  projectId: z.string().uuid(),
  channel: commonZod.channelSchema,
  secretLabel: z.string().trim().min(1),
  secretValue: z.string().min(1),
});

export async function createSecret(
  input: z.infer<typeof createSecretSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const key = await getProjectKey(input.projectId);
  const { nonce, secret } = await encrypt(key, input.secretValue);
  await upsertEntity(
    Secrets,
    {
      projectId: input.projectId,
      label: input.secretLabel,
      channel: input.channel,
      nonce,
      secret,
    },
    {
      conflictColumns: ['projectId', 'label'],
      upsertColumns: ['nonce', 'secret'],
    },
  );
  return output.ok({});
}
