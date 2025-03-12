import { Hono } from 'hono';
import { type HonoEnv } from '#core/utils.ts';
import output from '#extensions/hono/output.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi EmptyFavicon
   * @tags root
   */
  router.get('/favicon.ico', async (context, next) => {
    const signal = context.req.raw.signal;

    return output.ok();
  });
}
