import { join } from 'path';

import { defineConfig } from '@january/canary';
import { auth } from '@january/extensions/firebase';
import { hono } from '@january/extensions/hono';
import { identity } from '@january/extensions/identity';
import { postgresql, typeorm } from '@january/extensions/typeorm';

const appDir = join(process.cwd(), 'apps', 'api');

export default defineConfig({
  client: {
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
  },
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
    typeorm({
      database: postgresql(),
    }),
  ],
});
