import { type trigger } from '@january/declarative';
import z from 'zod';
import { getChannelEnv } from '#extensions/user/index.ts';
import { channelSchema } from '#extensions/zod/index.ts';
export const getSecretsValuesSchema = z.object({
  projectId: z.string().uuid(),
  channel: channelSchema,
});

export async function getSecretsValues(
  input: z.infer<typeof getSecretsValuesSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const env = await getChannelEnv({
    projectId: input.projectId,
    channel: input.channel,
  });
  return output.ok(env);
}
