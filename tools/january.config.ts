import { execFileSync } from 'child_process';

import { join } from 'path';

import { defineConfig } from '@january/canary';
import { auth } from '@january/extensions/firebase';
import { hono } from '@january/extensions/hono';
import { identity } from '@january/extensions/identity';
import { postgresql, typeorm } from '@january/extensions/typeorm';
import { npmRunPathEnv } from 'npm-run-path';
import { fileWatch } from './file-watcher.ts';

const appDir = join(process.cwd(), 'apps', 'api');
const rootDir = join(process.cwd());

await defineConfig({
  fs: {
    cwd: appDir,
  },
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

execFileSync('biome', ['check', 'apps/api/src/app', '--write'], {
  env: npmRunPathEnv(),
  cwd: rootDir,
});
