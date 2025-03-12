import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Hono } from 'hono';
import { streamText } from 'hono/streaming';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import output from '#extensions/hono/output.ts';
import { observeFile } from '#extensions/user/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi ReadProgress
   * @tags operations
   */
  router.get(
    '/operations/read',
    policies.authenticated,
    validate((payload) => ({
      traceId: { select: payload.query.traceId, against: z.string() },
    })),
    async (context, next) => {
      const { input } = context.var;
      const signal = context.req.raw.signal;
      return streamText(context, async (stream) => {
        const filePath = join(tmpdir(), input.traceId + '.jsonl');
        for await (const chunk of observeFile({
          filePath,
          signal,
        })) {
          await stream.write(chunk);
        }
      });
    },
  );
}
