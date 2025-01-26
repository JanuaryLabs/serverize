import { tables } from '@workspace/entities';
import { policies } from '@workspace/extensions/identity';
import {
  createQueryBuilder,
  execute,
  removeEntity,
  saveEntity,
  upsertEntity,
  useTransaction,
} from '@workspace/extensions/postgresql';
import {
  PROTOCOL,
  SERVERIZE_DOMAIN,
  clean,
  defaultHealthCheck,
  getChannelEnv,
  releaseCreatedDiscordWebhook,
  serverizeUrl,
  tellDiscord,
} from '@workspace/extensions/user';
import { channelSchema, orgNameValidator } from '@workspace/extensions/zod';
import z from 'zod';

import axios from 'axios';

import { trigger, workflow } from '@january/declarative';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import { getContainer, removeContainer } from 'serverize/docker';

export default {
  StartRelease: workflow({
    tag: 'operations',
    trigger: trigger.http({
      method: 'post',
      path: '/releases/start',
      policies: [policies.authenticated],
      input: (trigger) => ({
        releaseName: {
          select: trigger.body.releaseName,
          against: orgNameValidator,
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
          against: channelSchema,
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
        jwt: trigger.headers.Authorization,
      }),
    }),
    execute: async ({ input }) => {
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

      const { data } = await axios.post(
        `${serverizeUrl}/deploy`,
        {
          ...release,
          projectName: input.projectName,
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
        {
          headers: {
            Authorization: input.jwt,
          },
        },
      );
      return {
        traceId,
        releaseId: release.id,
        finalUrl: `${PROTOCOL}://${release.domainPrefix}.${SERVERIZE_DOMAIN}`,
      };
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
          select: trigger.path.releaseName,
          against: orgNameValidator,
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
          against: channelSchema,
        },
        jwt: trigger.headers.Authorization,
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
          select: trigger.path.channelName,
          against: channelSchema,
        },
        projectId: {
          select: trigger.body.projectId,
          against: z.string().uuid(),
        },
        projectName: {
          select: trigger.body.projectName,
          against: z.string().trim().min(1),
        },
        jwt: trigger.headers.Authorization,
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
          select: trigger.path.releaseName,
          against: orgNameValidator,
        },
        projectId: {
          select: trigger.body.projectId,
          against: z.string().uuid(),
        },
        channel: {
          select: trigger.body.channel,
          against: channelSchema,
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
};
