import { execSync } from 'node:child_process';
import { join } from 'node:path';

import { hono } from '@january/extensions/hono';
import { generate } from '@january/openapi';

const appDir = join(process.cwd(), 'apps', 'api');

await generate({
  primitives: [hono().primitives],
  fs: {
    features: join(appDir, 'src/january/features'),
    extensions: join(appDir, 'src/january/extensions'),
    tsconfig: join(appDir, 'tsconfig.january.json'),
  },
  client: {
    name: 'Serverize',
    output: join(process.cwd(), 'packages', 'client', 'src'),
    formatGeneratedCode: false,
    securityScheme: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
});

execSync(`npx biome check packages/client --write`, {
  cwd: process.cwd(),
});
