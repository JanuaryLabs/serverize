import axios from 'axios';
import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Releases from '#entities/releases.entity.ts';
import { consume } from '#extensions/hono/consume.ts';
import { createQueryBuilder } from '#extensions/postgresql/index.ts';
import {
  PROTOCOL,
  SERVERIZE_DOMAIN,
  releaseCreatedDiscordWebhook,
  serverizeUrl,
  tellDiscord,
} from '#extensions/user/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  router.post(
    '/operations/releases/:releaseName/restart',
    policies.authenticated,
    consume('application/json'),
    validate((payload) => ({
      releaseName: {
        select: payload.params.releaseName,
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
      jwt: { select: payload.headers.Authorization, against: z.any() },
    })),
    async (context, next) => {
      const { input } = context.var;
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
    },
  );
}
