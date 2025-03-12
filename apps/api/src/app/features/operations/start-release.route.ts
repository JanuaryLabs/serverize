import { join } from 'node:path';
import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Projects from '#entities/projects.entity.ts';
import Releases from '#entities/releases.entity.ts';
import Volumes from '#entities/volumes.entity.ts';
import { startServer } from '#extensions/docker/start.ts';
import { consume } from '#extensions/hono/consume.ts';
import output from '#extensions/hono/output.ts';
import {
  createQueryBuilder,
  execute,
  saveEntity,
  upsertEntity,
} from '#extensions/postgresql/index.ts';
import {
  PROTOCOL,
  SERVERIZE_DOMAIN,
  clean,
  defaultHealthCheck,
  getChannelEnv,
} from '#extensions/user/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi StartRelease
   * @tags operations
   */
  router.post(
    '/operations/releases/start',
    policies.authenticated,
    consume('application/json'),
    validate((payload) => ({
      releaseName: {
        select: payload.body.releaseName,
        against: commonZod.orgNameValidator,
      },
      projectId: { select: payload.body.projectId, against: z.string().uuid() },
      projectName: {
        select: payload.body.projectName,
        against: z.string().trim().min(1),
      },
      channel: {
        select: payload.body.channel,
        against: commonZod.channelSchema,
      },
      tarLocation: { select: payload.body.tarLocation, against: z.string() },
      runtimeConfig: {
        select: payload.body.runtimeConfig,
        against: z.string(),
      },
      port: { select: payload.body.port, against: z.number().optional() },
      protocol: {
        select: payload.body.protocol,
        against: z.enum(['https', 'tcp']).optional(),
      },
      image: { select: payload.body.image, against: z.string().trim().min(1) },
      volumes: {
        select: payload.body.volumes,
        against: z.array(z.string()).optional(),
      },
      serviceName: {
        select: payload.body.serviceName,
        against: z.any().optional(),
      },
      environment: {
        select: payload.body.environment,
        against: z.any().optional(),
      },
    })),
    async (context, next) => {
      const signal = context.req.raw.signal;
      const { input } = context.var;
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
        protocol: input.protocol,
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
          src: [
            input.projectName,
            input.channel,
            orgName,
            input.releaseName,
            src,
          ]
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

      // TOOD: delegate this to worker
      await startServer(
        signal,
        {
          ...release,
          projectName: input.projectName,
          // TODO: create seperate entity (or just get them from the docker image assuming we are going to have a registry around) for tarLocation, image and runtimeConfig (basically and column that will be updated later on not when the release is created)
          tarLocation: release.tarLocation!,
          protocol: (release as any).protocol,
          image: release.image!,
          environment: { ...channelEnv, ...input.environment },
          serviceName: input.serviceName,
          network: [
            input.projectName,
            input.channel,
            orgName,
            input.releaseName,
          ]
            .filter(Boolean)
            .join('-'),
          traceId,
          volumes,
        },
        JSON.parse(release.runtimeConfig!),
      );
      return output.ok({
        traceId,
        releaseId: release.id,
        finalUrl: `${PROTOCOL}://${release.domainPrefix}.${SERVERIZE_DOMAIN}`,
      });
    },
  );
}
