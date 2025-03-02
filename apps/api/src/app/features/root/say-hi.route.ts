import { Hono } from 'hono';
import { type HonoEnv } from '#core/utils.ts';
import { createOutput } from '#hono';

export default async function (router: Hono<HonoEnv>) {
  router.get('/', async (context, next) => {
    const {} = context.var;
    const output = createOutput(context);
    return output.ok({
      status: 'UP',
    });
  });
}
