import { docker } from '@serverize/docker';
import type { Hono } from 'hono';
import { streamText } from 'hono/streaming';
import z from 'zod';
import type { HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi StreamContainerLogs
   * @tags container
   */
  router.get(
    '/container/logs',
    validate((payload) => ({
      projectName: {
        select: payload.query.projectName,
        against: commonZod.orgNameValidator,
      },
      channelName: {
        select: payload.query.channelName,
        against: commonZod.orgNameValidator,
      },
      releaseName: {
        select: payload.query.releaseName,
        against: commonZod.orgNameValidator,
      },
      timestamp: {
        select: payload.query.timestamp,
        against: z.boolean().default(true).optional(),
      },
      details: {
        select: payload.query.details,
        against: z.boolean().default(true).optional(),
      },
      tail: {
        select: payload.query.tail,
        against: z.number().max(250).default(250).optional(),
      },
    })),
    async (context, next) => {
      const { input } = context.var;
      const signal = context.req.raw.signal;
      return streamText(context, async (stream) => {
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
          await stream.write(chunk);
        }
      });
    },
  );
}
