import { Hono } from 'hono';
import { type HonoEnv } from '#core/utils.ts';
import output from '#extensions/hono/output.ts';

export default async function (router: Hono<HonoEnv>) {
  router.get('/', async (context, next) => {
    return output.ok({
      status: 'UP',
    });
  });
}
