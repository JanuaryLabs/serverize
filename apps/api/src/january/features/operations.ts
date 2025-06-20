import z from 'zod';
import policies from '#core/policies.ts';
import { tables } from '#entities';
import {
  createQueryBuilder,
  execute,
  removeEntity,
  saveEntity,
  upsertEntity,
  useTransaction,
} from '#extensions/postgresql/index.ts';
import {
  PROTOCOL,
  SERVERIZE_DOMAIN,
  clean,
  defaultHealthCheck,
  getChannelEnv,
  observeFile,
  releaseCreatedDiscordWebhook,
  tellDiscord,
} from '#extensions/user/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { trigger, workflow } from '@januarylabs/declarative';
import { getContainer, removeContainer } from '@serverize/docker';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import { startServer } from '#extensions/docker/start.ts';
import output from '#extensions/hono/output.ts';

export default {
  ReadProgress: workflow({
    tag: 'operations',
    trigger: trigger.stream({
      method: 'get',
      path: '/read',
      policies: [policies.authenticated],
      input: (trigger) => ({
        traceId: {
          select: trigger.query.traceId,
          against: z.string(),
        },
      }),
    }),
    execute: async ({ input, signal }) => {
      const filePath = join(tmpdir(), input.traceId + '.jsonl');
      return observeFile({
        filePath,
        signal,
      });
    },
  }),
  StartRelease: workflow({
    tag: 'operations',
    trigger: trigger.http({
      method: 'post',
      path: '/releases/start',
      policies: [policies.authenticated],
      input: (trigger) => ({
        releaseName: {
          select: trigger.body.releaseName,
          against: commonZod.orgNameValidator,
        },
        projectId: {
          select: trigger.body.projectId,
          against: z.string().uuid(),
        },
        projectName: {
          select: trigger.body.projectName,
          against: z.string().trim().min(1),
        },
        channel: {
          select: trigger.body.channel,
          against: commonZod.channelSchema,
        },
        tarLocation: {
          select: trigger.body.tarLocation,
          against: z.string(),
        },
        runtimeConfig: {
          select: trigger.body.runtimeConfig,
          against: z.string(),
        },
        port: {
          select: trigger.body.port,
          against: z.number().optional(),
        },
        protocol: {
          select: trigger.body.protocol,
          against: z.enum(['https', 'tcp']).optional(),
        },
        image: {
          select: trigger.body.image,
          against: z.string().trim().min(1),
        },
        volumes: {
          select: trigger.body.volumes,
          against: z.array(z.string()).optional(),
        },
        serviceName: {
          select: trigger.body.serviceName,
          against: z.any().optional(),
        },
        environment: {
          select: trigger.body.environment,
          against: z.any().optional(),
        },
      }),
    }),
    execute: async ({ input, signal }) => {
      const traceId = crypto.randomUUID();
      const getOrgIdQb = createQueryBuilder(tables.projects, 'projects')
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
      const release = await saveEntity(tables.releases, {
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
          tables.volumes,
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
  }),
  RestartRelease: workflow({
    tag: 'operations',
    trigger: trigger.http({
      method: 'post',
      path: '/releases/:releaseName/restart',
      policies: [policies.authenticated],
      input: (trigger) => ({
        releaseName: {
          select: trigger.params.releaseName,
          against: commonZod.orgNameValidator,
        },
        projectId: {
          select: trigger.body.projectId,
          against: z.string().uuid(),
        },
        projectName: {
          select: trigger.body.projectName,
          against: z.string().trim().min(1),
        },
        channel: {
          select: trigger.body.channel,
          against: commonZod.channelSchema,
        },
        jwt: {
          select: trigger.headers.authorization,
          against: z.string(),
        },
      }),
    }),
    execute: async ({ input }) => {
      const release = await createQueryBuilder(tables.releases, 'releases')
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
      // const { data } = await axios.post(
      //   `${serverizeUrl}/restart`,
      //   {
      //     projectName: input.projectName,
      //     traceId,
      //     ...release,
      //   },
      //   {
      //     headers: {
      //       Authorization: input.jwt,
      //     },
      //   },
      // );
      const finalUrl = `${PROTOCOL}://${release.domainPrefix}.${SERVERIZE_DOMAIN}`;
      await tellDiscord(
        `new release ${finalUrl}`,
        releaseCreatedDiscordWebhook,
      ).catch((err) => {
        // no-op
      });
      return {
        traceId,
        releaseId: release.id,
        finalUrl,
      };
    },
  }),
  RestartChannel: workflow({
    tag: 'operations',
    trigger: trigger.http({
      method: 'post',
      path: '/channels/:channelName/restart',
      policies: [policies.authenticated],
      input: (trigger) => ({
        channel: {
          select: trigger.params.channelName,
          against: commonZod.channelSchema,
        },
        projectId: {
          select: trigger.body.projectId,
          against: z.string().uuid(),
        },
        projectName: {
          select: trigger.body.projectName,
          against: z.string().trim().min(1),
        },

        jwt: {
          select: trigger.headers.authorization,
          against: z.string(),
        },
      }),
    }),
    execute: async ({ input }) => {
      const releases = await execute(
        createQueryBuilder(tables.releases, 'releases')
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

      const traces: string[] = [];
      for (const release of releases) {
        const traceId = crypto.randomUUID();
        // await axios.post(
        //   `${serverizeUrl}/restart`,
        //   {
        //     projectName: input.projectName,
        //     traceId,
        //     ...release,
        //   },
        //   {
        //     headers: {
        //       Authorization: input.jwt,
        //     },
        //   },
        // );
        traces.push(traceId);
      }
      return { traces };
    },
  }),
  DeleteRelease: workflow({
    tag: 'operations',
    trigger: trigger.http({
      method: 'delete',
      path: '/releases/:releaseName',
      input: (trigger) => ({
        releaseName: {
          select: trigger.params.releaseName,
          against: commonZod.orgNameValidator,
        },
        projectId: {
          select: trigger.body.projectId,
          against: z.string().uuid(),
        },
        channel: {
          select: trigger.body.channel,
          against: commonZod.channelSchema,
        },
      }),
    }),
    execute: async ({ input }) => {
      await useTransaction(async () => {
        const release = await createQueryBuilder(tables.releases, 'releases')
          .where('releases.name = :name', { name: input.releaseName })
          .andWhere('releases.status = :status', { status: 'completed' })
          // .andWhere('releases.conclusion = :conclusion', {
          //   conclusion: 'success',
          // })
          .andWhere('releases.channel = :channel', {
            channel: input.channel,
          })
          .andWhere('releases.projectId = :projectId', {
            projectId: input.projectId,
          })
          .getOneOrFail();

        const container = await getContainer({
          name: release.containerName!,
        });

        if (!container) {
          throw new ProblemDetailsException({
            title: 'Container not found',
            detail: `Release ${input.releaseName} have no corresponding container`,
            status: 404,
          });
        }

        await removeEntity(tables.releases, release);
        await removeEntity(
          tables.volumes,
          createQueryBuilder(tables.volumes, 'volumes').where(
            'volumes.releaseId = :releaseId',
            {
              releaseId: release.id,
            },
          ),
        );
        await removeContainer(container);
      });
    },
  }),
  RestoreRelease: workflow({
    tag: 'operations',
    trigger: trigger.http({
      method: 'post',
      path: '/releases/:releaseName/restore',
      policies: [policies.authenticated, policies.notImplemented],
      input: (trigger) => ({
        releaseName: {
          select: trigger.params.releaseName,
          against: commonZod.orgNameValidator,
        },
        projectId: {
          select: trigger.body.projectId,
          against: z.string().uuid(),
        },
        channel: {
          select: trigger.body.channel,
          against: commonZod.channelSchema,
        },
      }),
    }),
    execute: async ({ input }) => {
      await useTransaction(async () => {
        const releaseQb = createQueryBuilder(tables.releases, 'releases')
          .withDeleted()
          .where('releases.name = :name', { name: input.releaseName })
          .andWhere('releases.channel = :channel', {
            channel: input.channel,
          })
          .andWhere('releases.projectId = :projectId', {
            projectId: input.projectId,
          });

        const release = await releaseQb.getOne();

        if (!release) {
          throw new ProblemDetailsException({
            title: 'Release not found',
            detail: `Release ${input.releaseName} not found`,
            status: 404,
          });
        }

        await releaseQb.restore().execute();

        // Restore associated volumes
        const volumesQb = createQueryBuilder(tables.volumes, 'volumes')
          .withDeleted()
          .where('volumes.releaseId = :releaseId', {
            releaseId: release.id,
          });

        await volumesQb.restore().execute();
      });
    },
  }),
};
