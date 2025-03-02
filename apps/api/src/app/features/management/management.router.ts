import { Hono } from 'hono';
import { type HonoEnv } from '#core/utils.ts';
const router = new Hono<HonoEnv>();

for await (const route of [
  import('./delete-org.route.ts'),
  import('./list-organizations.route.ts'),
  import('./create-default-organization.route.ts'),
  import('./create-organization.route.ts'),
  import('./create-workspace.route.ts'),
  import('./create-project.route.ts'),
  import('./patch-project.route.ts'),
  import('./list-projects.route.ts'),
  import('./list-user-organizations.route.ts'),
  import('./link-user.route.ts'),
  import('./signin.route.ts'),
]) {
  route.default(router);
}

export default ['/', router] as const;
