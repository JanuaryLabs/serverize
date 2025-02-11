import { relative } from 'node:path';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { showRoutes } from 'hono/dev';

import application from './app';
import './startup';

const dirRelativeToCwd = relative(process.cwd(), import.meta.dirname);

application.use('/:filename{.+.png$}', serveStatic({ root: dirRelativeToCwd }));

application.use(
  '/:filename{.+.swagger.json$}',
  serveStatic({
    root: dirRelativeToCwd,
    rewriteRequestPath: (path) => path.split('/').pop() as string,
  }),
);

const port = parseInt(process.env.PORT ?? '3000', 10);
serve({
  fetch: application.fetch,
  port: port,
});

if (process.env.NODE_ENV === 'development') {
  showRoutes(application, { verbose: true, colorize: true });
}

console.log(`Server running on http://localhost:${port}`);
