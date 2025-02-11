import { Hono } from 'hono';
import { authorize } from '#core/identity';
import { type HonoEnv } from '#core/utils.ts';
import { createOutput } from '#hono';
import * as root from './root';
const router = new Hono<HonoEnv>();
router.get('/favicon.ico', authorize(), async (context, next) => {
  const output = createOutput(context);
  await root.emptyFavicon(output, context.req.raw.signal);
  return output.finalize();
});
router.get('/', authorize(), async (context, next) => {
  const output = createOutput(context);
  await root.sayHi(output, context.req.raw.signal);
  return output.finalize();
});
router.get('/health', authorize(), async (context, next) => {
  const output = createOutput(context);
  await root.healthCheck(output, context.req.raw.signal);
  return output.finalize();
});
export default ['/', router] as const;
