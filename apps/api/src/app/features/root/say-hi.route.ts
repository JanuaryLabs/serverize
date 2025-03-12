import { Hono } from 'hono';
import { type HonoEnv } from '#core/utils.ts';
import output from '#extensions/hono/output.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi SayHi
   * @tags root
   */
  router.get('/', async (context, next) => {
    const signal = context.req.raw.signal;

    return output.ok({
      status: 'UP',
    });
  });
}
