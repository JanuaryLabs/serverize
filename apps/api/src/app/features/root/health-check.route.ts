import { Hono } from 'hono';
import { type HonoEnv } from '#core/utils.ts';
import output from '#extensions/hono/output.ts';
import { dataSource } from '#extensions/postgresql/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi HealthCheck
   * @tags root
   */
  router.get('/health', async (context, next) => {
    const signal = context.req.raw.signal;

    await dataSource.query('SELECT 1');
    return output.ok({
      status: 'UP',
    });
  });
}
