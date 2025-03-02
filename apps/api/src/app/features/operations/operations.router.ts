import { Hono } from 'hono';
import { type HonoEnv } from '#core/utils.ts';
const router = new Hono<HonoEnv>();

for await (const route of [
  import('./start-release.route.ts'),
  import('./restart-release.route.ts'),
  import('./restart-channel.route.ts'),
  import('./delete-release.route.ts'),
  import('./restore-release.route.ts'),
]) {
  route.default(router);
}

export default ['/', router] as const;
