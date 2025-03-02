import { Hono } from 'hono';
import { type HonoEnv } from '#core/utils.ts';
import { dataSource } from '#extensions/postgresql/index.ts';
import { createOutput } from '#hono';

export default async function (router: Hono<HonoEnv>) {
  router.get('/health', async (context, next) => {
    const {} = context.var;
    const output = createOutput(context);
    await dataSource.query('SELECT 1');
    return output.ok({
      status: 'UP',
    });
  });
}
