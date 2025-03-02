import { Hono } from 'hono';
import { type HonoEnv } from '#core/utils.ts';
const router = new Hono<HonoEnv>();

for await (const route of [
  import('./create-token.route.ts'),
  import('./revoke-token.route.ts'),
  import('./list-tokens.route.ts'),
  import('./get-token.route.ts'),
  import('./create-release.route.ts'),
  import('./complete-release.route.ts'),
  import('./patch-release.route.ts'),
  import('./create-release-snapshot.route.ts'),
  import('./list-releases.route.ts'),
  import('./create-secret.route.ts'),
  import('./get-secrets.route.ts'),
  import('./delete-secret.route.ts'),
  import('./get-secrets-values.route.ts'),
  import('./exchange-token.route.ts'),
  import('./invalidate-organization-tokens.route.ts'),
]) {
  route.default(router);
}

export default ['/', router] as const;
