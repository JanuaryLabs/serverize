import z from 'zod';
import * as commonZod from '#extensions/zod/index.ts';

import { docker } from 'serverize/docker';

import { trigger, workflow } from '@january/declarative';
import { toTraefikConfig } from '#extensions/user/index.ts';

export default {
  StreamContainerLogs: workflow({
    tag: 'container',
    trigger: trigger.stream({
      method: 'get',
      path: '/logs',
      input: (trigger) => ({
        projectName: {
          select: trigger.query.projectName,
          against: commonZod.orgNameValidator,
        },
        channelName: {
          select: trigger.query.channelName,
          against: commonZod.orgNameValidator,
        },
        releaseName: {
          select: trigger.query.releaseName,
          against: commonZod.orgNameValidator,
        },
        timestamp: {
          select: trigger.query.timestamp,
          against: z.boolean().default(true).optional(),
        },
        details: {
          select: trigger.query.details,
          against: z.boolean().default(true).optional(),
        },
        tail: {
          select: trigger.query.tail,
          against: z.number().max(250).default(250).optional(),
        },
      }),
    }),
    execute: async ({ input, signal, output }) => {
      const containers = await docker.listContainers({
        all: true,
        filters: {
          label: [
            `serverize.projectName=${input.projectName}`,
            `serverize.channelName=${input.channelName}`,
            `serverize.releaseName=${input.releaseName}`,
          ],
        },
      });
      console.log(
        `Found ${containers.length} containers for ${input.projectName}/${input.channelName}/${input.releaseName}`,
      );
      const [containerInfo] = containers;
      const container = docker.getContainer(containerInfo.Id);
      // const stdout = new PassThrough();
      // const stderr = new PassThrough();

      const logsStream = await container.logs({
        follow: true,
        stdout: true,
        stderr: true,
        timestamps: input.timestamp,
        details: input.details,
        tail: input.tail,
        abortSignal: signal,
      });
      for await (const chunk of logsStream) {
        await output.write(chunk);
      }
      // return output.stream(logsStream);
      // docker.modem.demuxStream(logsStream, stdout, stderr);
      // return concatStreams(stdout, stderr);
      // return logsStream;
    },
  }),
  ConfigDiscovery: workflow({
    tag: 'containers',
    trigger: trigger.http({
      method: 'get',
      path: '/discovery',
    }),
    execute: async () => {
      // const qb = createQueryBuilder(tables.releases, 'releases')
      //   .select(['releases.port', 'releases.domainPrefix'])
      //   .where('releases.status = :status', { status: 'completed' })
      //   .andWhere('releases.conclusion = :conclusion', {
      //     conclusion: 'success',
      //   });
      // const releases = await execute(qb);
      // return toTraefikConfig(
      //   releases.map((it) => ({
      //     port: it.port || 3000,
      //     domainPrefix: it.domainPrefix,
      //   })),
      // );
      const containers = await docker.listContainers({
        all: true,
        filters: {
          label: ['serverize.enable=true'],
        },
      });
      return toTraefikConfig(
        containers.map((it) => ({
          domainPrefix: it.Labels['serverize.prefix'],
          port: it.Labels['serverize.port'],
          protocol: it.Labels['serverize.protocol'],
        })),
      );
    },
  }),
};
