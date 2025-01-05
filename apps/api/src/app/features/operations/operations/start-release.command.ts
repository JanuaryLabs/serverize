import { trigger } from '@january/declarative';
import {
  createQueryBuilder,
  execute,
  saveEntity,
  upsertEntity,
} from '@workspace/extensions/postgresql';
import {
  PROTOCOL,
  SERVERIZE_DOMAIN,
  clean,
  defaultHealthCheck,
  getChannelEnv,
  serverizeUrl,
} from '@workspace/extensions/user';
import { channelSchema, orgNameValidator } from '@workspace/extensions/zod';
import axios from 'axios';
import z from 'zod';
import Projects from '../../management/projects.entity.ts';
import Releases from '../../projects/releases.entity.ts';
import Volumes from '../../projects/volumes.entity.ts';
export const startReleaseSchema = z.object({
  releaseName: orgNameValidator,
  projectId: z.string().uuid(),
  projectName: z.string().trim().min(1),
  channel: channelSchema,
  tarLocation: z.string(),
  runtimeConfig: z.string(),
  port: z.number().optional(),
  image: z.string().trim().min(1),
  volumes: z.array(z.string()).optional(),
  serviceName: z.any().optional(),
  environment: z.any().optional(),
  jwt: z.any(),
});

export async function startRelease(
  input: z.infer<typeof startReleaseSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const traceId = crypto.randomUUID();
  const getOrgIdQb = createQueryBuilder(Projects, 'projects')
    .innerJoinAndSelect('projects.workspace', 'workspace')
    .innerJoinAndSelect('workspace.organization', 'organization')
    .where('projects.id = :projectId', { projectId: input.projectId });
  const [project] = await execute(getOrgIdQb);
  const orgName = project.workspace?.organization?.name || 'unknown';
  const domainPrefix = [
    input.projectName,
    input.channel,
    orgName,
    input.releaseName === 'latest' ? '' : input.releaseName,
    input.serviceName,
  ]
    .filter(Boolean)
    .join('-');
  const runtimeConfig = JSON.parse(input.runtimeConfig ?? '{}');
  const release = await saveEntity(Releases, {
    projectId: input.projectId,
    status: 'in_progress',
    channel: input.channel,
    name: input.releaseName,
    tarLocation: input.tarLocation,
    port: input.port,
    runtimeConfig: JSON.stringify({
      ...runtimeConfig,
      Healthcheck: Object.assign(
        {},
        // only http containers needs default healthcheck
        runtimeConfig.port ? defaultHealthCheck(runtimeConfig.port) : {},
        clean(runtimeConfig.Healthcheck ?? {}),
      ),
    }),
    domainPrefix: domainPrefix,
    image: input.image,
    serviceName: input.serviceName,
  });

  const volumes = (input.volumes ?? [])
    .map((volume) => volume.split(':'))
    .map(([src, dest]) => ({
      src: [input.projectName, input.channel, orgName, input.releaseName, src]
        .filter(Boolean)
        .join('-'),
      dest: dest,
    }));

  for (const volume of volumes) {
    await upsertEntity(
      Volumes,
      {
        releaseId: release.id,
        src: volume.src,
        dest: volume.dest,
      },
      { conflictColumns: ['src'], upsertColumns: ['dest'] },
    );
  }

  const channelEnv = await getChannelEnv({
    channel: input.channel,
    projectId: input.projectId,
  });

  const { data } = await axios.post(
    `${serverizeUrl}/deploy`,
    {
      ...release,
      projectName: input.projectName,
      environment: { ...channelEnv, ...input.environment },
      serviceName: input.serviceName,
      network: [input.projectName, input.channel, orgName, input.releaseName]
        .filter(Boolean)
        .join('-'),
      traceId,
      volumes,
    },
    {
      headers: {
        Authorization: input.jwt,
      },
    },
  );
  return output.ok({
    traceId,
    releaseId: release.id,
    finalUrl: `${PROTOCOL}://${release.domainPrefix}.${SERVERIZE_DOMAIN}`,
  });
}
