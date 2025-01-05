import { apiReference } from '@scalar/hono-api-reference';
import { createOutput } from '@workspace/extensions/hono';
import { authorize } from '@workspace/identity';
import { type HonoEnv } from '@workspace/utils';
import { Hono } from 'hono';
import * as root from './root';
import swagger from './root.swagger.json';
const router = new Hono<HonoEnv>();
router.get('/swagger', apiReference({ spec: { url: swagger as any } }));

router.get(
  '/root/swagger',
  apiReference({
    spec: { url: swagger as any },
  }),
);
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
