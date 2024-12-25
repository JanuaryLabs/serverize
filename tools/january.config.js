import { join } from 'path';

import { defineConfig } from '@january/canary';
import { auth } from '@january/extensions/firebase';
import { fly } from '@january/extensions/fly';
import { hono } from '@january/extensions/hono';
import { identity } from '@january/extensions/identity';
import { postgresql, typeorm } from '@january/extensions/typeorm';

const skipClient = process.argv.includes('--skip-client');

const appDir = join(process.cwd(), 'apps', 'api');

export default defineConfig({
  client: !skipClient
    ? {
        // packageName: '@serverize/client',
        name: 'Serverize',
        output: join(process.cwd(), 'packages/client'),
        securityScheme: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      }
    : undefined,
  fs: {
    cwd: appDir,
  },
  tsconfigFilePaths: join(process.cwd(), 'tsconfig.base.json'),
  baseTsConfig: '../tsconfig.json',
  tsconfigName: join(appDir, 'tsconfig.app.json'),
  formatGeneratedCode: false,
  extensions: [
    identity,
    hono(),
    auth(),
    fly(),
    typeorm({
      database: postgresql(),
    }),
  ],
});
