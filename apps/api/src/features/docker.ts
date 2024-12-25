import { concatStreams } from '@extensions/user';
import { orgNameValidator } from '@extensions/zod';
import { PassThrough } from 'stream';
import z from 'zod';

import { feature, trigger, workflow } from '@january/declarative';

import { docker } from 'serverize/docker';

export default feature({
  tables: {},
  workflows: [
    workflow('StreamContainerLogs', {
      tag: 'container',
      trigger: trigger.stream({
        method: 'get',
        path: '/logs',
        input: (trigger) => ({
          projectName: {
            select: trigger.query.projectName,
            against: orgNameValidator,
          },
          channelName: {
            select: trigger.query.channelName,
            against: orgNameValidator,
          },
          releaseName: {
            select: trigger.query.releaseName,
            against: orgNameValidator,
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
      execute: async ({ input, signal }) => {
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
        // docker.modem.demuxStream(logsStream, stdout, stderr);
        // return concatStreams(stdout, stderr);
        return logsStream;
      },
    }),
  ],
});
