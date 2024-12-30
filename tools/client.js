import { join } from 'node:path';

import { hono } from '@january/extensions/hono';
import { generate } from '@january/openapi';

const appDir = join(process.cwd(), 'apps', 'api');
await generate({
  primitives: [hono().primitives],
  client: {
    name: 'Serverize',
    output: join(process.cwd(), 'packages', 'client', 'src'),
    formatGeneratedCode: true,
    securityScheme: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  fs: {
    extensions: join(appDir, 'output/src/extensions'),
    features: join(appDir, 'src/features'),
    tsconfig: join(appDir, 'tsconfig.app.json'),
  },
});
