import { Hono } from 'hono';
import { streamText } from 'hono/streaming';
import z from 'zod';
import { authorize } from '#core/identity';
import { type HonoEnv } from '#core/utils.ts';
import { parseOrThrow } from '#core/validation.ts';
import { createOutput } from '#hono';
import * as container from './container';
import * as containers from './containers';
const router = new Hono<HonoEnv>();
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
router.get('/containers/discovery', authorize(), async (context, next) => {
  const output = createOutput(context);
  await containers.configDiscovery(output, context.req.raw.signal);
  return output.finalize();
});
export default ['/', router] as const;
