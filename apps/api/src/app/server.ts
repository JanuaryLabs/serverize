import './startup.ts';
import { serve } from '@hono/node-server';

import application from './app.ts';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);

serve({
  fetch: application.fetch,
  port: port,
});

console.log(`Server running on http://localhost:${port}`);
