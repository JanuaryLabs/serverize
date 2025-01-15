import { trigger } from '@january/declarative';
import { channelSchema, orgNameValidator } from '@workspace/extensions/zod';
import axios from 'axios';
import z from 'zod';
export const deleteReleaseSchema = z.object({
  releaseName: orgNameValidator,
  projectId: z.string().uuid(),
  channel: channelSchema,
});

export async function deleteRelease(
  input: z.infer<typeof deleteReleaseSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  // TODO: implement
  return output.ok();
}
