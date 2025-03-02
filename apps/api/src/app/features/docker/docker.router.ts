import { Hono } from 'hono';
import { type HonoEnv } from '#core/utils.ts';
const router = new Hono<HonoEnv>();

for await (const route of [
  import('./stream-container-logs.route.ts'),
  import('./config-discovery.route.ts'),
]) {
  route.default(router);
}

export default ['/', router] as const;
