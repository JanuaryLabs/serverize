import { trigger } from '@january/declarative';
import { createQueryBuilder, execute } from '@workspace/extensions/postgresql';
import { serverizeUrl } from '@workspace/extensions/user';
import { channelSchema } from '@workspace/extensions/zod';
import axios from 'axios';
import z from 'zod';
import Releases from '../../projects/releases.entity.ts';
export const restartChannelSchema = z.object({
  channel: channelSchema,
  projectId: z.string().uuid(),
  projectName: z.string().trim().min(1),
  jwt: z.any(),
});

export async function restartChannel(
  input: z.infer<typeof restartChannelSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const releases = await execute(
    createQueryBuilder(Releases, 'releases')
      .andWhere('releases.status = :status', { status: 'completed' })
      .andWhere('releases.conclusion = :conclusion', {
        conclusion: 'success',
      })
      .andWhere('releases.channel = :channel', {
        channel: input.channel,
      })
      .andWhere('releases.projectId = :projectId', {
        projectId: input.projectId,
      }),
  );

  let traces: string[] = [];
  for (const release of releases) {
    const traceId = crypto.randomUUID();
    await axios.post(
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
    traces.push(traceId);
  }
  return output.ok({ traces });
}
