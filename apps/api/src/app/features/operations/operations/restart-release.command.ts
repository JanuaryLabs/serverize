import { type trigger } from '@january/declarative';
import axios from 'axios';
import z from 'zod';
import Releases from '#entities/releases.entity.ts';
import { createQueryBuilder } from '#extensions/postgresql/index.ts';
import {
  PROTOCOL,
  SERVERIZE_DOMAIN,
  releaseCreatedDiscordWebhook,
  serverizeUrl,
  tellDiscord,
} from '#extensions/user/index.ts';
import { channelSchema, orgNameValidator } from '#extensions/zod/index.ts';
export const restartReleaseSchema = z.object({
  releaseName: orgNameValidator,
  projectId: z.string().uuid(),
  projectName: z.string().trim().min(1),
  channel: channelSchema,
  jwt: z.any(),
});

export async function restartRelease(
  input: z.infer<typeof restartReleaseSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const release = await createQueryBuilder(Releases, 'releases')
    .where('releases.name = :name', { name: input.releaseName })
    .andWhere('releases.status = :status', { status: 'completed' })
    .andWhere('releases.conclusion = :conclusion', {
      conclusion: 'success',
    })
    .andWhere('releases.channel = :channel', {
      channel: input.channel,
    })
    .andWhere('releases.projectId = :projectId', {
      projectId: input.projectId,
    })
    .getOneOrFail();
  const traceId = crypto.randomUUID();
  const { data } = await axios.post(
    `${serverizeUrl}/restart`,
    {
      projectName: input.projectName,
      traceId,
      ...release,
    },
    {
      headers: {
        Authorization: input.jwt,
      },
    },
  );
  const finalUrl = `${PROTOCOL}://${release.domainPrefix}.${SERVERIZE_DOMAIN}`;
  await tellDiscord(
    `new release ${finalUrl}`,
    releaseCreatedDiscordWebhook,
  ).catch((err) => {
    // no-op
  });
  return output.ok({
    traceId,
    releaseId: release.id,
    finalUrl,
  });
}
