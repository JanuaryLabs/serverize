import { execSync } from 'node:child_process';
import { join } from 'node:path';

import { hono } from '@january/extensions/hono';
import { generate } from '@january/openapi';
import { fileWatch } from './file-watcher.ts';

const appDir = join(process.cwd(), 'apps', 'api');

await generate({
  primitives: [hono().primitives, fileWatch().primitives],
  fs: {
    features: join(appDir, 'src/january/features'),
    extensions: join(appDir, 'src/january/extensions'),
    tsconfig: join(appDir, 'tsconfig.january.json'),
  },
  zod: join(appDir, 'src/january/extensions/zod/index.ts'),
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

execSync(`biome check packages/client --write`, {
  cwd: process.cwd(),
});
