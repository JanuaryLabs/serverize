import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Releases from '#entities/releases.entity.ts';
import { consume } from '#extensions/hono/consume.ts';
import output from '#extensions/hono/output.ts';
import { createQueryBuilder, execute } from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi RestartChannel
   * @tags operations
   */
  router.post(
    '/operations/channels/:channelName/restart',
    policies.authenticated,
    consume('application/json'),
    validate((payload) => ({
      channel: {
        select: payload.params.channelName,
        against: commonZod.channelSchema,
      },
      projectId: { select: payload.body.projectId, against: z.string().uuid() },
      projectName: {
        select: payload.body.projectName,
        against: z.string().trim().min(1),
      },
      jwt: { select: payload.headers.authorization, against: z.string() },
    })),
    async (context, next) => {
      const signal = context.req.raw.signal;
      const { input } = context.var;
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
      return output.ok({ traces });
    },
  );
}
