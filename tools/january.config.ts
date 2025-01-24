import { execSync } from 'child_process';

import { join } from 'path';

import { defineConfig } from '@january/canary';
import { auth } from '@january/extensions/firebase';
import { hono } from '@january/extensions/hono';
import { identity } from '@january/extensions/identity';
import { postgresql, typeorm } from '@january/extensions/typeorm';
import { fileWatch } from './file-watcher.ts';
const appDir = join(process.cwd(), 'apps', 'api');

await defineConfig({
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
    fileWatch(),
    typeorm({
      database: postgresql(),
    }),
  ],
});

execSync(`npx biome check apps/api/src/app --write`, {
  cwd: process.cwd(),
});
