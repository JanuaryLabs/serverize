import { apiReference } from '@scalar/hono-api-reference';
import { authorize } from '@workspace/identity';
import { type HonoEnv } from '@workspace/utils';
import { parseOrThrow } from '@workspace/validation';
import { Hono } from 'hono';
import { streamText } from 'hono/streaming';
import z from 'zod';
import * as container from './container';
import swagger from './docker.swagger.json';
const router = new Hono<HonoEnv>();
router.get(
  '/docker/swagger',
  apiReference({
    spec: { url: swagger as any },
  }),
);
router.get('/container/logs', authorize(), async (context, next) => {
  const query = context.req.query();
  const input = parseOrThrow(container.streamContainerLogsSchema, {
    projectName: query.projectName,
    channelName: query.channelName,
    releaseName: query.releaseName,
    timestamp: query.timestamp,
    details: query.details,
    tail: query.tail,
  });
  return streamText(context, async (stream) => {
    for await (const chunk of await container.streamContainerLogs(
      input,
      context.req.raw.signal,
    )) {
      await stream.write(chunk);
    }
  });
});
export default ['/', router] as const;
