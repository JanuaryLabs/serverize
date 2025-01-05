import { execSync } from 'child_process';

import { join } from 'path';

import { defineConfig } from '@january/canary';
import { auth } from '@january/extensions/firebase';
import { hono } from '@january/extensions/hono';
import { identity } from '@january/extensions/identity';
import { postgresql, typeorm } from '@january/extensions/typeorm';

const appDir = join(process.cwd(), 'apps', 'api');

export default defineConfig({
  fs: {
    cwd: appDir,
  },
  tsconfigFilePaths: join(process.cwd(), 'tsconfig.base.json'),
  baseTsConfig: '../tsconfig.json',
  tsconfigName: join(appDir, 'tsconfig.app.json'),
  formatGeneratedCode: false,
  extensions: [
    identity,
    hono({
      generateSwagger: () => false,
    }),
    auth(),
    typeorm({
      database: postgresql(),
    }),
  ],
});

execSync(
  `./node_modules/.bin/prettier apps/api/src/app/**/* --write --config .prettierrc`,
  { cwd: process.cwd() },
);
