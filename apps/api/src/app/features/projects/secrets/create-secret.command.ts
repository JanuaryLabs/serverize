import { upsertEntity } from '@workspace/extensions/postgresql';
import { encrypt, getProjectKey } from '@workspace/extensions/user';
import { channelSchema } from '@workspace/extensions/zod';
import z from 'zod';
import Secrets from '../secrets.entity.ts';
import { trigger } from '@january/declarative';
export const createSecretSchema = z.object({
  projectId: z.string().uuid(),
  channel: channelSchema,
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