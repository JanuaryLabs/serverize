import { Hono } from 'hono';
import { type HonoEnv } from '#core/utils.ts';
const router = new Hono<HonoEnv>();

for await (const route of [
  import('./empty-favicon.route.ts'),
  import('./say-hi.route.ts'),
  import('./health-check.route.ts'),
]) {
  route.default(router);
}

export default ['/', router] as const;
