import { trigger } from '@january/declarative';
import { getChannelEnv } from '@workspace/extensions/user';
import { channelSchema } from '@workspace/extensions/zod';
import z from 'zod';
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
